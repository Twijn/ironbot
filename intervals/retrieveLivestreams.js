const { HelixStream } = require("@twurple/api");
const { EmbedBuilder, codeBlock } = require("discord.js");

const utils = require("../utils/");
const config = require("../config.json");

let gameCache = [];
let livestreamCache = [];

const UPDATE_ENVOY_USER_TIME = 30 * 60 * 1000;

(async function() {
    gameCache = await utils.Schemas.TwitchGame.find({});
    livestreamCache = await utils.Schemas.TwitchStream.find({endDate: null})
        .populate(["channel"]);

    console.log(`Retrieved ${gameCache.length} cached Twitch games and ${livestreamCache.length} active livestreams`);
})();

/**
 * Formats an embed given a HelixStream and listener
 * @param {HelixStream} hStream 
 * @param {any} stream
 * @param {any} listener
 * @returns {EmbedBuilder}
 */
const formatEmbed = function(hStream, stream, listener) {
    const builder = new EmbedBuilder()
        .setURL(`https://twitch.tv/${listener.twitchUser.login}`)
        .setTimestamp(hStream.startDate)
        .setColor(0xf28227)
        .setAuthor({iconURL: listener.twitchUser.profile_image_url, name: listener.twitchUser.display_name})
        .setTitle(`${hStream.userDisplayName} is now live!`)
        .setDescription(`<@${listener.discordUser._id}> is now live on Twitch at [twitch.tv/${listener.twitchUser.login}](https://twitch.tv/${listener.twitchUser.login})!\n**Come stop by!**`)
        .setImage(hStream.getThumbnailUrl(384,216) + "?nocache=" + Math.floor(Date.now() / (5 * 60 * 1000)))
        .addFields({
            name: "Game",
            value: codeBlock(hStream.gameName),
            inline: true,
        }, {
            name: "Viewers",
            value: codeBlock(`${hStream.viewers} viewer${hStream.viewers === 1 ? "" : "s"}`),
            inline: true,
        })
        .setFooter({iconURL: "https://autumnsdawn.net/assets/images/icons/adventurers_500px.png", text: "The Adventurers Guild"});

    if (hStream.gameId) {
        builder.setThumbnail(gameCache.find(x => x._id === hStream.gameId)?.boxArtUrl);
    }

    return builder;
}

/**
 * Fires when a new stream is detected
 * @param {HelixStream} hStream 
 * @param {any} stream
 * @param {any[]} listeners
 */
const newStream = function(hStream, stream, listeners) {
    listeners.forEach(listener => {
        try {
            const embed = formatEmbed(hStream, stream, listener);
            const channel = utils.EnvoyListenerManager.getDiscordChannel(listener.discordChannel);
            channel.send({embeds: [embed], content: listener.roleMention}).then(message => {
                utils.Schemas.DiscordMessage.create({
                    _id: message.id,
                    channel: message.channel.id,
                    stream: stream,
                }).catch(console.error);
            }, console.error);
        } catch(err) {
            console.error(err);
        }

        const discordId = listener.discordUser?._id ? listener.discordUser._id : listener.discordUser;
        utils.guild.members.fetch(discordId).then(member => {
            member.roles.add(config.discord.roles.live).catch(console.error);
        }, console.error);
    });
    console.log(hStream.userDisplayName + " is now live");
}

/**
 * Fires when a stream status is updated
 * @param {HelixStream} hStream 
 * @param {any} stream
 * @param {any} listeners
 */
const streamUpdate = async function(hStream, stream, listeners) {
    if (listeners.length === 0) return console.error("No listeners given");
    const messages = await stream.getMessages();
    messages.forEach(message => {
        message.edit({embeds: [formatEmbed(hStream, stream, listeners[0])]}).catch(console.error);
    });
}

/**
 * Fires when a stream goes offline
 * @param {any} stream
 * @param {any} listener
 */
const streamOffline = async function(stream, listener) {
    const messages = await stream.getMessages();
    messages.forEach(message => {
        message.delete({reason: "User went offline"}).catch(console.error);
    });
    console.log(listener.twitchUser.display_name + " is now offline");

    const discordId = listener.discordUser?._id ? listener.discordUser._id : listener.discordUser;
    utils.guild.members.fetch(discordId).then(member => {
        member.roles.remove(config.discord.roles.live).catch(console.error);
    }, console.error);
}

module.exports = async () => {
    const envoyListeners = utils.EnvoyListenerManager.getAllListeners();
    let distinctChannels = [];
    envoyListeners.forEach(envoyListener => {
        if (!distinctChannels.includes(envoyListener.twitchUser._id))
            distinctChannels.push(envoyListener.twitchUser._id);
    });

    if (distinctChannels.length > 99) {
        console.log("Warning: Distinct livestream channels exceeded 100. Aborting")
        return;
    }

    const streams = await utils.Twitch.raw.streams.getStreamsByUserIds(distinctChannels);
    for (let i = 0; i < streams.length; i++) {
        const hStream = streams[i];
        try {
            const user = await utils.Twitch.getUserById(hStream.userId, false, true);
            let stream = livestreamCache.find(x => x._id === hStream.id);
            let game = gameCache.find(x => x._id === hStream.gameId);

            const listeners = envoyListeners.filter(x => x.twitchUser._id === user._id);
    
            if (!game) {
                const hGame = await hStream.getGame();
                game = await utils.Schemas.TwitchGame.create({
                    _id: hGame.id,
                    name: hGame.name,
                    boxArtUrl: hGame.getBoxArtUrl(144,192),
                });
                gameCache.push(game);
            }
    
            if (!stream) {
                stream = await utils.Schemas.TwitchStream.create({
                    _id: hStream.id,
                    startDate: hStream.startDate,
                    channel: user,
                });
                livestreamCache.push(stream);
                newStream(hStream, stream, listeners);
            } else {
                streamUpdate(hStream, stream, listeners);
            }

            await utils.Schemas.TwitchStreamStatus.create({
                stream: stream,
                game,
                title: hStream.title,
                viewers: hStream.viewers,
            });
        } catch(err) {
            console.error(err);
        }
    }

    for (let i = 0; i < envoyListeners.length; i++) {
        const listener = envoyListeners[i];

        if (Date.now() - listener.twitchUser.updated_at >= UPDATE_ENVOY_USER_TIME) {
            try {
                await listener.twitchUser.updateData();
                console.log(`Updated data for envoy ${listener.twitchUser.display_name}`)
            } catch(err) {
                console.error(err);
            }
        }

        const stream = livestreamCache.find(x => x.channel._id === listener.twitchUser._id);
        if (stream && streams.filter(x => x.userId === listener.twitchUser._id).length === 0) {
            stream.endDate = Date.now();
            await stream.save();
            livestreamCache = livestreamCache.filter(x => x._id !== stream._id);
            streamOffline(stream, listener);
        }
    }
};
