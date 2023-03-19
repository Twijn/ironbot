const { VoiceState } = require("discord.js");

const NUM_REGEX = /#\d+/

const listener = {
    name: "vcManager",
    /**
     * Executor for this listener
     * @param {VoiceState} oldState 
     * @param {VoiceState} newState 
     */
    execute: async (oldState, newState) => {
        try {
            if (oldState.channelId !== newState.channelId) {
                const oldReg = NUM_REGEX.exec(oldState.channel?.name);
                const newReg = NUM_REGEX.exec(newState.channel?.name);
                
                if (oldState.channel?.name && oldReg && oldState.channel.members.size === 0) {
                    const rawNum = oldReg[0];
                    const num = Number(rawNum.replace("#", ""));
                    
                    if (!isNaN(num)) {
                        const parentId = oldState.channel.parentId;

                        const nextChannelName = oldState.channel.name.replace(rawNum, "#" + (num + 1));
                        const nextChannel = oldState.guild.channels.cache.find(x => x.name === nextChannelName && x.parentId === parentId);
                        
                        if (nextChannel) {
                            let lastPosition = oldState.channel.position;
                            
                            if (nextChannel.members.size === 0) {
                                await nextChannel.delete();
                            } else {
                                await nextChannel.edit({
                                    name: oldState.channel.name,
                                });
                            }
    
                            let nextNum = num;
                            let hasEmpty = false;
                            for (let i = num + 1; i < 20; i++) {
                                let channel = oldState.guild.channels.cache.find(x => x.name === nextChannelName.replace("#" + (num + 1), "#" + i) && x.parentId === parentId);
                                
                                if (channel) {
                                    if (channel.members.size > 0 || !hasEmpty) {
                                        await channel.edit({
                                            name: channel.name.replace("#" + i, "#" + nextNum),
                                        });
                                        nextNum++;
    
                                        if (channel.members.size === 0) hasEmpty = true;
                                        if (channel.position > lastPosition) lastPosition = channel.position;
                                    } else {
                                        await channel.delete();
                                    }
                                }
                            }
                            console.log(lastPosition)
    
                            if (nextChannel.members.size > 0) {
                                if (hasEmpty) {
                                    await oldState.channel.delete();
                                } else {
                                    await oldState.channel.edit({
                                        name: nextChannelName.replace("#" + (num + 1), "#" + nextNum),
                                        position: lastPosition + 1,
                                    });
                                }
                            }
    
                            return;
                        }
                    }
                }
    
                if (newState.channel?.name && newReg) {
                    const rawNum = newReg[0];
                    const num = Number(rawNum.replace("#", ""));
                    
                    if (!isNaN(num)) {
                        const nextChannelName = newState.channel.name.replace(rawNum, "#" + (num + 1));
                        const nextChannel = newState.guild.channels.cache.find(x => x.name === nextChannelName && x.parentId === newState.channel.parentId);
                        
                        if (!nextChannel) {
                            newState.guild.channels.create({
                                name: nextChannelName,
                                type: newState.channel.type,
                                permissionOverwrites: newState.channel.permissionOverwrites.cache,
                                bitrate: newState.channel.bitrate,
                                userLimit: newState.channel.userLimit,
                                parent: newState.channel.parent,
                            }).then(channel => {
                                channel.setPosition(newState.channel.position + 1);
                            }, console.error);
                        }
                    }
                }
            }
        } catch(e) {
            console.error(e);
        }
    }
}

module.exports = listener;