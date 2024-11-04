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
                const user = await utils.Discord.getUserById(String(id), false, true);
                if (user.avatar !== member.user.avatar ||
                    (member.user.globalName && user.globalName !== member.user.globalName)) {
                    console.log(`[MemberManager] Updating user information for ${member.user.username}`);
                    await utils.Schemas.DiscordUser.findByIdAndUpdate(String(id), {
                        globalName: member.user.globalName,
                        avatar: member.user.avatar,
                    });
                    // Retrieve the user again with bypassCache to update the cached user.
                    await utils.Discord.getUserById(String(id), true);
                }
                seeded++;
            } catch(err) {
                console.error("[MemberManager] Error while seeding cache:");
                console.error(err);
            }
        }
        console.log(`[MemberManager] Seeded ${seeded} members`);
        console.log(`[MemberManager] Loaded ${this.members.size} members`);
    }

    getMembersWithRole(roleId) {
        if (!this.members) return [];
        return this.members.filter(member => member.roles.cache.has(roleId));
    }

    async getMembersByRole(asDbUser = false) {
        let result = [];
        let existingIds = [];
        for (let r = 0; r < this.roles.length; r++) {
            const role = this.roles[r];
            let finalMembers = [];
            let membersWithRole = this.getMembersWithRole(role.id);
            for (const [id, member] of membersWithRole) {
                if (existingIds.includes(id)) continue;
                if (asDbUser) {
                    finalMembers.push(await utils.Discord.getUserById(id, false, true));
                } else {
                    finalMembers.push(member);
                }
                existingIds.push(id);
            }
            result.push({role, members: finalMembers});
        }
        return result;
    }

}

module.exports = MemberManager;
