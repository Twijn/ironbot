const { VoiceState, Snowflake } = require("discord.js");

const utils = require("../../utils");

const MINIMUM_MEMBERS = 2;

const haveMembersChanged = (oldMembers, newMembers) => {
    let members = [];
    for (let [id, member] of oldMembers) {
        members.push(member.id);
    }
    for (let [id, member] of newMembers) {
        if (!members.includes(member.id)) {
            return true;
        }
        members.splice(members.indexOf(member.id), 1);
    }
    return members.length > 0;
}

/**
 * Stores voice log data
 * @type {Map<Snowflake, number>}
 */
let logData = new Map();

const listener = {
    name: "voiceLog",
    /**
     * Executor for this listener
     * @param {VoiceState} oldState
     * @param {VoiceState} newState
     */
    execute: async (oldState, newState) => {
        if (oldState?.channelId && newState?.channelId) {
            if (!haveMembersChanged(oldState.channel.members, newState.channel.members)) {
                return;
            }
        }

        if (newState?.channelId && newState.channel.members.size >= MINIMUM_MEMBERS) {
            for (let [id] of newState.channel.members) {
                if (!logData.has(id)) {
                    logData.set(id, Date.now());
                }
            }
        } else if (oldState?.channel) {
            if (logData.has(newState.member.id)) {
                const discordUser = await utils.Discord.getUserById(newState.member.id, false, true);
                const identity = await discordUser.createIdentity();
                console.log(`[VoiceLog] Logging ${Math.floor((Date.now() - logData.get(newState.member.id))/1000)} seconds for ${discordUser.username}`);
                utils.Schemas.DiscordVoiceLog.create({
                    channel: oldState.channel.id,
                    channelName: oldState.channel.name,
                    identity,
                    startTime: logData.get(newState.member.id),
                    endTime: Date.now(),
                }).catch(console.error);
                logData.delete(newState.member.id);
            }
            if (oldState.channel.members.size <= MINIMUM_MEMBERS) {
                for (let [id] of oldState.channel.members) {
                    if (logData.has(id)) {
                        const discordUser = await utils.Discord.getUserById(id, false, true);
                        const identity = await discordUser.createIdentity();
                        console.log(`[VoiceLog] Logging ${Math.floor((Date.now() - logData.get(id))/1000)} seconds for ${discordUser.username}`);
                        utils.Schemas.DiscordVoiceLog.create({
                            channel: oldState.channel.id,
                            channelName: oldState.channel.name,
                            identity,
                            startTime: logData.get(id),
                            endTime: Date.now(),
                        }).catch(console.error);
                        logData.delete(id);
                    }
                }
            }
        }
    }
}

module.exports = listener;
