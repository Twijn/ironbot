const { GuildMember } = require("discord.js");

const config = require("../../config.json");

const listener = {
    name: "addRoles",
    /**
     * Executor for this listener
     * @param {GuildMember} member 
     */
    execute: async member => {
        member.roles.add(config.rolesOnJoin).catch(err => {
            console.error(err);
        });
    }
}

module.exports = listener;