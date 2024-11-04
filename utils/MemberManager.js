const {Snowflake, GuildMember} = require("discord.js");

const Role = require("./schemas/Role");

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
        console.log(`[MemberManager] Loaded ${this.members.size} members`);
    }

    getMembersWithRole(roleId) {
        return this.members.filter(member => member.roles.cache.has(roleId));
    }

    getMembersByRole() {
        let members = this.members.clone();
        let result = [];
        this.roles.forEach(role => {
            const roleMembers = members.filter(member => member.roles.cache.has(role._id));
            members = members.filter(member => !member.roles.cache.has(role._id));
            result.push({role, members: roleMembers});
        });
        return result;
    }

}

module.exports = MemberManager;
