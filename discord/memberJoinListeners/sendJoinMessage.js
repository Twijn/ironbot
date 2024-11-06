const { GuildMember, EmbedBuilder } = require("discord.js");
const config = require("../../config.json");

const listener = {
    name: "sendJoinMessage",
    /**
     * Executor for this listener
     * @param {GuildMember} member 
     */
    execute: async member => {
        const embed = new EmbedBuilder()
            .setTitle(config.join.title.replace("{{username}}", member.displayName))
            .setDescription(
                config.join.messages[Math.floor(Math.random()*config.join.messages.length)]
                    .replace("{{username}}", member.displayName))
            .setAuthor({
                name: member.displayName,
                iconURL: member.displayAvatarURL(),
            })
            .setThumbnail(member.guild.iconURL({size: 128}))
            .setColor(0xf28227)
            .setFooter({iconURL: "https://www.illumindal.com/assets/images/icons/illumindal_120px.png", text: "The Illumindal Guild"});
        
        member.guild.channels.cache.get(config.join.channel)
            .send({
                content: "https://youtu.be/R--PmgRfw08",
                embeds: [embed],
            })
            .catch(console.error);
    }
}

module.exports = listener;