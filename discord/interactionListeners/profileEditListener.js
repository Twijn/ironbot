const { ModalSubmitInteraction, EmbedBuilder, codeBlock, cleanCodeBlockContent} = require("discord.js");

const utils = require("../../utils/");

const listener = {
    name: "profileEditListener",
    verify: interaction => interaction.isModalSubmit() && interaction.customId === "profile-edit",
    /**
     * Executor for this listener
     * @param {ModalSubmitInteraction} interaction
     */
    execute: async interaction => {
        const discordUser = await utils.Discord.getUserById(interaction.member.id);
        let identity = await discordUser.createIdentity();

        let biography = interaction.fields.getTextInputValue("biography");
        let steamCode = interaction.fields.getTextInputValue("steam-code");
        let switchCode = interaction.fields.getTextInputValue("switch-code");

        if (biography.length === 0) biography = null;
        if (steamCode.length === 0) steamCode = null;
        if (switchCode.length === 0) switchCode = null;

        identity = await utils.Schemas.Identity.findByIdAndUpdate(identity._id, {
            biography,
            friendCodes: {
                steam: steamCode,
                switch: switchCode,
            }
        }, {new:true});

        utils.CacheManager.removeIdentity(identity._id);

        const embed = new EmbedBuilder()
            .setTitle("Profile updated!")
            .setDescription(codeBlock(cleanCodeBlockContent(
                `Biography: ${identity.biography ? identity.biography : "Not Set"}\n` +
                `Steam Code: ${identity.friendCodes?.steam ? identity.friendCodes.steam : "Not Set"}\n` +
                `Switch Code: ${identity.friendCodes?.switch ? identity.friendCodes.switch : "Not Set"}`
            )))
            .setColor(0xf28227);

        interaction.reply({embeds: [embed], ephemeral: true}).catch(console.error);
    }
}

module.exports = listener;
