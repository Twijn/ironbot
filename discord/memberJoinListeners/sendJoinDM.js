const { GuildMember, EmbedBuilder, codeBlock } = require("discord.js");

const listener = {
    name: "sendJoinDM",
    /**
     * Executor for this listener
     * @param {GuildMember} member 
     */
    execute: async member => {
        const embed = new EmbedBuilder()
            .setTitle("Hello 👋 I'm Autumn, the Adventurers Guild custom bot!")
            .setDescription("This is a helpful message I send to all new Adventurers to help you get started! Don't worry you can delete this DM whenever you wish 😉")
            .addFields({
                name: "Getting Started",
                value: "Here are a few things to help you get started!" +
                "\n\n**1.** You can assign roles to yourself in the [Roles](https://discord.com/channels/859283517451010088/907318297903628288/1065013032163487855) channel! Just tell me what you would like 😄" +
                "\n**2.** You can check [Guild Announcements](https://discord.com/channels/859283517451010088/872566378769555558) to see what big things are happening in the Guild!" +
                "\n**3.** You can find all kinds of goodies in [Iron's Office](https://discord.com/channels/859283517451010088/997520183021281350) and [Info Center](https://discord.com/channels/859283517451010088/1062418247481315411)" +
                "\n**4.** You can share about your adventures in [The Guilds Hall](https://discord.com/channels/859283517451010088/872566568880594984)" +
                "\n**5.** If you would like to introduce yourself, do so in [Introductions](https://discord.com/channels/859283517451010088/999376175858188338)! (Don't worry, we have a template below!)" +
                "\n\n**Happy Adventures & Welcome Home!**",
            }, {
                name: "Introduction Template",
                value: codeBlock(
                    "Twitch or YouTube username:" +
                    "\nWhat should we call you:" +
                    "\nWhat brought you to the community:" +
                    "\nWhere are you from:" +
                    "\nYour favorite game:" +
                    "\nMost used emote:" +
                    "\nFavorite IRL activity:" +
                    "\nFavorite food:" +
                    "\nTell a fun fact about you:"
                ),
            })
            .setColor(0xf28227);
        
        // member.send({embeds: [embed]}).catch(err => {
        //     // we don't really need to do anything here, yet...
        // });
    }
}

module.exports = listener;