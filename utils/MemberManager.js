const {Snowflake, GuildMember} = require("discord.js");

const Role = require("./schemas/Role");

const UPDATE_MEMBER_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

class MemberManager {

    utils;

    /**
     * Stores all members in the Guild
     * @type {Map<Snowflake, GuildMember>}
     */
    members;

    roles = [];

    constructor(utils) {
        this.utils = utils;

        this.updateRoles().catch(console.error);
        this.updateMembers().catch(console.error);

        setInterval(() => {
            this.updateMembers().catch(console.error);
        }, UPDATE_MEMBER_INTERVAL);
    }

    async createRole(id, display, position, name) {
        if (this.roles.find(x => x._id === id)) {
            throw "This role already exists!";
        }

        const role = await Role.create({
            _id: id, display, position, name,
        });
        this.roles.push(role);
        return role;
    }

    async editRole(id, display, position, name, description) {
        const role = await Role.findByIdAndUpdate(id, {
            display, position, name, description,
        }, {
            new: true,
        });

        for (let i = 0; i < this.roles.length; i++) {
            if (this.roles[i]._id === id) {
                this.roles[i] = role;
            }
        }

        this.roles.sort((a, b) => b.position - a.position);

        return role;
    }

    async deleteRole(id) {
        await Role.findByIdAndDelete(id);
        this.roles = this.roles.filter(role => role._id !== id);
    }

    getRole(id) {
        return this.roles.find(x => x._id === id);
    }

    async updateRoles() {
        this.roles = await Role.find({});
        this.roles.sort((a, b) => b.position - a.position);
        for (let i = 0; i < this.roles.length; i++) {
            const role = this.roles[i];
            if (!role.color) {
                console.log("Updating color of " + role.name);
                while (!this.utils.Discord?.guild?.roles) {
                    await sleep(50);
                }
                const discordRole = await this.utils.Discord.guild.roles.fetch(role._id);
                this.roles[i] = await Role.findByIdAndUpdate(role._id, {
                    color: discordRole.hexColor,
                }, {new: true});
            }
        }
        console.log(`[MemberManager] Loaded ${this.roles.length} roles`);
    }

    async updateMembers() {
        while (!this.utils?.Discord?.guild) {
            await sleep(50);
        }
        this.members = await this.utils.Discord.guild.members.fetch();
        this.members = this.members.filter(x => !x.user.bot);

        let seeded = 0;
        for (const [id, member] of this.members) {
            // We seed to cache to reduce latency when viewing things such as /members
            try {
                let user = await utils.Discord.getUserById(String(id), false, true);
                let update = false;
                if (!user.identity) {
                    await user.createIdentity();
                    update = true;
                }
                if (user.avatar !== member.user.avatar ||
                    (member.user.globalName && user.globalName !== member.user.globalName) ||
                    (!user.joinedTimestamp || member.joinedTimestamp !== user.joinedTimestamp.getTime())) {
                    console.log(`[MemberManager] Updating user information for ${member.user.username}`);
                    await utils.Schemas.DiscordUser.findByIdAndUpdate(String(id), {
                        globalName: member.user.globalName,
                        avatar: member.user.avatar,
                        joinedTimestamp: member.joinedTimestamp,
                    });
                    // Retrieve the user again with bypassCache to update the cached user.
                    update = true;
                }
                if (update) {
                    user = await utils.Discord.getUserById(String(id), true);
                }
                await user.identity.getProfile();
                seeded++;
            } catch(err) {
                console.error("[MemberManager] Error while seeding cache:");
                console.error(err);
            }
        }
        console.log(`[MemberManager] Seeded ${seeded} members`);
        console.log(`[MemberManager] Loaded ${this.members.size} members`);
    }

    /**
     * Returns a Discord member from an ID
     * @param id {string|Snowflake}
     * @returns {Promise<GuildMember>}
     */
    async getMember(id) {
        let member = this.members.get(id);
        if (!member) {
            member = await this.utils.Discord.guild.members.fetch(id);
        }
        return member;
    }

    /**
     * Returns members with a role
     * @param roleId {string|Snowflake}
     * @param asDbUser {boolean}
     * @returns {Promise<*[]>}
     */
    async getMembersWithRole(roleId, asDbUser = false) {
        if (!this.members) return [];
        const members = this.members.filter(member => member.roles.cache.has(roleId));
        let result = [];
        for (const [id, member] of members) {
            if (asDbUser) {
                result.push(await utils.Discord.getUserById(id, false, true));
            } else {
                result.push(member);
            }
        }
        return result;
    }

    /**
     * Gets a member's role from an ID
     * @param id
     * @returns {Promise<*>}
     */
    async getMemberRole(id) {
        const member = await this.getMember(id);
        for (let r = 0; r < this.roles.length; r++) {
            const role = this.roles[r];
            if (member.roles.cache.has(role.id)) {
                return role;
            }
        }
        return null;
    }

    /**
     * Returns all members by their role
     * @param asDbUser
     * @returns {Promise<{role:object,members:object[]}[]>}
     */
    async getMembersByRole(asDbUser = false) {
        let result = [];
        let existingIds = [];
        for (let r = 0; r < this.roles.length; r++) {
            const role = this.roles[r];
            let members = await this.getMembersWithRole(role.id, asDbUser);
            members = members.filter(x => !existingIds.includes(x.id));
            members.forEach(x => existingIds.push(x.id));
            result.push({role, members});
        }
        return result;
    }

}

module.exports = MemberManager;
