const { User, CategoryChannel, Role, Colors, ChannelType, PermissionsBitField, EmbedBuilder, codeBlock, cleanCodeBlockContent } = require("discord.js");

const con = require("../../database");
const config = require("../../config.json");

const Cachable = require("../Cache/Cachable");
const PartyChannel = require("./PartyChannel");
const PartyMessage = require("./PartyMessage");

class Party extends Cachable {

    /**
     * Surrogate ID for the party
     * @type {number}
     */
    id;

    /**
     * Name of the party
     * @type {string}
     */
    name;

    /**
     * Long description of the party
     * @type {string}
     */
    description;

    /**
     * Owner of the party
     * @type {User}
     */
    owner;

    /**
     * Category of the party
     * @type {CategoryChannel?}
     */
    category;

    /**
     * Role for party moderators
     * @type {Role?}
     */
    modRole;

    /**
     * Role for party participants
     * @type {Role?}
     */
    userRole;

    /**
     * Random generated Image name for the party
     * @type {string?}
     */
    image;

    /**
     * Whether the party is public or not
     * @type {boolean}
     */
    pub;
    
    /**
     * Whether the party is active or not
     * @type {boolean}
     */
    active;

    /**
     * Constructor for a Party
     * @param {number} id 
     * @param {string} name 
     * @param {string} description 
     * @param {User} owner 
     * @param {CategoryChannel?} category 
     * @param {Role?} modRole 
     * @param {Role?} userRole 
     * @param {string?} image 
     * @param {boolean} pub 
     * @param {boolean} active 
     */
    constructor(id, name, description, owner, category, modRole, userRole, image, pub, active) {
        super();
        
        this.id = id;
        this.name = name;
        this.description = description;
        this.owner = owner;
        this.category = category;
        this.modRole = modRole;
        this.userRole = userRole;
        this.image = image;
        this.pub = pub;
        this.active = active;
    }

    /**
     * Returns the image URL for this party, or null
     * @returns {string?}
     */
    imageURL() {
        return this.image ? config.party.image_uri + this.image : null
    }

    /**
     * Returns channels owned by this party, not including the Category
     * @returns {Promise<PartyChannel[]>}
     */
    getChannels() {
        return new Promise((resolve, reject) => {
            con.query("select * from party__channel where party_id = ?;", [this.id], async (err, res) => {
                if (!err) {
                    try {
                        let channels = [];
                        const guild = await global.discord.guilds.fetch(config.discord.guild);

                        for (let i = 0; i < res.length; i++) {
                            channels = [
                                ...channels,
                                new PartyChannel(
                                    await guild.channels.fetch(res[i].id),
                                    res[i].type
                                )
                            ]
                        }

                        resolve(channels);
                    } catch(e) {
                        reject(e);
                    }
                } else {
                    reject(err);
                }
            });
        });
    }

    /**
     * Returns messages owned by this party
     * @returns {Promise<PartyMessage[]>}
     */
    getMessages() {
        return new Promise((resolve, reject) => {
            con.query("select * from party__message where party_id = ?;", [this.id], async (err, res) => {
                if (!err) {
                    try {
                        let messages = [];
                        const guild = await global.discord.guilds.fetch(config.discord.guild);

                        for (let i = 0; i < res.length; i++) {
                            const channel = await guild.channels.fetch(res[i].channel_id);
                            messages = [
                                ...messages,
                                new PartyMessage(
                                    await channel.messages.fetch(res[i].id),
                                    res[i].type
                                )
                            ]
                        }

                        resolve(messages);
                    } catch(e) {
                        reject(e);
                    }
                } else {
                    reject(err);
                }
            });
        });
    }

    /**
     * Activates this Party
     * @returns {Promise<Party>}
     */
    activate() {
        return new Promise(async (resolve, reject) => {
            if (this.active) {
                reject("This party is already active!");
                return;
            }

            try {
                const guild = await global.discord.guilds.fetch(config.discord.guild);
                const ownerMember = await guild.members.fetch(this.owner.id);

                const channels = await this.getChannels();

                if (!this.modRole) {
                    const prevRole = await guild.roles.fetch(config.party.position_after.mod);
                    this.modRole = await guild.roles.create({
                        name: this.name + " Staff",
                        color: 0x7fc96a,
                        position: prevRole.position,
                        reason: "Auto-generated from activation of " + this.name,
                    });

                    await con.pquery("update party set role_mod_id = ? where id = ?;", [this.modRole.id, this.id]);

                    await ownerMember.roles.add(this.modRole);
                }

                if (!this.userRole) {
                    const prevRole = await guild.roles.fetch(config.party.position_after.user);
                    this.userRole = await guild.roles.create({
                        name: this.name,
                        color: Colors.DarkBlue,
                        position: prevRole.position,
                        reason: "Auto-generated from activation of " + this.name,
                    });

                    await con.pquery("update party set role_user_id = ? where id = ?;", [this.userRole.id, this.id]);

                    await ownerMember.roles.add(this.userRole);
                }

                if (!this.category) {
                    const prevCategory = await guild.channels.fetch(config.party.position_after.category);
                    this.category = await guild.channels.create({
                        name: this.name,
                        type: ChannelType.GuildCategory,
                        position: prevCategory.position,
                        reason: "Auto-generated from activation of " + this.name,
                    });

                    await this.category.permissionOverwrites.edit(guild.roles.everyone, {
                        ViewChannel: false,
                    });
                    await this.category.permissionOverwrites.edit(this.modRole, {
                        ViewChannel: true,
                    });
                    await this.category.permissionOverwrites.edit(this.userRole, {
                        ViewChannel: true,
                    });
                    
                    await con.pquery("update party set category_id = ? where id = ?;", [this.category.id, this.id]);
                }

                let staffUrl;

                if (!channels.find(x => x.type === "mod")) {
                    const modChannel = await guild.channels.create({
                        name: "party-staff",
                        type: ChannelType.GuildText,
                        reason: "Auto-generated from activation of " + this.name,
                    });

                    await modChannel.setParent(this.category, {
                        lockPermissions: false,
                        reason: "Auto-generated from activation of " + this.name,
                    });

                    await modChannel.permissionOverwrites.edit(guild.roles.everyone, {
                        ViewChannel: false,
                    });
                    await modChannel.permissionOverwrites.edit(this.modRole, {
                        ViewChannel: true,
                    });

                    staffUrl = modChannel.url;

                    const embed = new EmbedBuilder()
                        .setTitle("Welcome to your new Staff Channel!")
                        .setDescription("**Hey adventurer!**\nWelcome to your new Staff Channel! You can use this channel to discuss information regarding your Party.\n**Make sure you check out the public party channel, too!**")
                        .setColor(0xf28227);

                    await modChannel.send({content: this.modRole.toString(), embeds: [embed]});

                    await con.pquery("insert into party__channel (id, party_id, type) values (?, ?, 'mod');", [modChannel.id, this.id]);
                }

                let userUrl;

                if (!channels.find(x => x.type === "user" && x.channel.type === ChannelType.GuildText)) {
                    const userChannel = await guild.channels.create({
                        name: "discord-chat",
                        type: ChannelType.GuildText,
                        reason: "Auto-generated from activation of " + this.name,
                    });

                    await userChannel.setParent(this.category, {
                        lockPermissions: true,
                        reason: "Auto-generated from activation of " + this.name,
                    });

                    userUrl = userChannel.url;

                    await con.pquery("insert into party__channel (id, party_id, type) values (?, ?, 'user');", [userChannel.id, this.id]);
                }

                if (!channels.find(x => x.type === "user" && x.channel.type === ChannelType.GuildVoice)) {
                    const userChannel = await guild.channels.create({
                        name: "Party #1",
                        type: ChannelType.GuildVoice,
                        reason: "Auto-generated from activation of " + this.name,
                    });

                    await userChannel.setParent(this.category, {
                        lockPermissions: true,
                        reason: "Auto-generated from activation of " + this.name,
                    });

                    await con.pquery("insert into party__channel (id, party_id, type) values (?, ?, 'user');", [userChannel.id, this.id]);
                }
                
                this.active = true;
                await con.pquery("update party set active = true where id = ?;", [this.id]);

                const dmEmbed = new EmbedBuilder()
                    .setTitle("You're a party leader!")
                    .setDescription(`Hey ${this.owner.toString()}, this message is to inform you that your Party suggestion, \`${this.name}\`, was accepted!\n\nVisit your Party staff channel [here](${staffUrl}), and your public Party channel [here](${userUrl}).`)
                    .setColor(0xf28227);

                this.owner.send({embeds: [dmEmbed]}).catch(() => {})

                let messages = await this.getMessages();

                messages = messages.filter(x => x.type === "suggest");

                for (let i = 0; i < messages.length; i++) {
                    try {
                        await messages[i].message.delete();
                        await con.pquery("delete from party__message where id = ?;", [messages[i].message.id]);
                    } catch(e) {}
                }

                resolve(this);
            } catch(e) {
                reject(e);
            }
        });
    }


    /**
     * Deletes this Party with the given Reason
     * @param {string?} reason 
     * @returns {Promise<void>}
     */
    delete(reason = null) {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.modRole) {
                    await this.modRole.delete();
                }
                if (this.userRole) {
                    await this.userRole.delete();
                }
                if (this.category) {
                    await this.category.delete();
                }

                const messages = await this.getMessages();

                for (let i = 0; i < messages.length; i++) {
                    try {
                        await messages[i].message.delete({
                            reason: reason,
                        });
                    } catch(e) {}
                }

                await con.pquery("delete from party__message where party_id = ?;", [this.id]);

                const channels = await this.getChannels();

                for (let i = 0; i < channels.length; i++) {
                    try {
                        await channels[i].channel.delete({
                            reason: reason,
                        });
                    } catch(e) {}
                }

                await con.pquery("delete from party__channel where party_id = ?;", [this.id]);

                await con.pquery("delete from party where id = ?;", [this.id]);

                const dmEmbed = new EmbedBuilder()
                    .setTitle(this.active ? "Your Party was deleted!" : "Your party suggestion was denied!")
                    .setDescription(`Hey ${this.owner.toString()}, this is notification that your party, \`${this.name}\`, was ${this.active ? "deleted" : "denied"}.`)
                    .setColor(0xf28227);

                if (reason) {
                    dmEmbed.addFields({
                        name: "Reason",
                        value: codeBlock(cleanCodeBlockContent(reason)),
                    })
                }

                this.owner.send({embeds: [dmEmbed]}).catch(() => {})
            } catch(e) {
                reject(e);
            }
        });
    }
}

module.exports = Party;
