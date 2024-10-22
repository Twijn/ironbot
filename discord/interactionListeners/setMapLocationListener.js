const { ModalSubmitInteraction } = require("discord.js");

const utils = require("../../utils/");

const listener = {
    name: "setMapLocationListener",
    verify: interaction => interaction.isModalSubmit() && interaction.customId.startsWith("set-loc_"),
    /**
     * Executor for this listener
     * @param {ModalSubmitInteraction} interaction
     */
    execute: async interaction => {
        let [,lat,lng] = interaction.customId.split("_");
        lat = Number(lat);
        lng = Number(lng);

        if (isNaN(lat) || isNaN(lng)) {
            return interaction.error("Latitude and longitude must be a number. Try again");
        }

        const discordUser = await utils.Discord.getUserById(interaction.user.id, false, true);
        const identity = await discordUser.createIdentity();

        utils.MapManager.saveLocation(lat, lng, interaction.fields.getTextInputValue("name"), identity._id).then(data => {
            interaction.success(
`Successfully set your location!
\`\`\`Location: ${data.name}
Latitude: ${data.latitude.toFixed(7)}
Longitude: ${data.longitude.toFixed(7)}\`\`\`
[View the Adventurer's Map here.](https://illumindal.com/map)`
            );
        }, err => {
            interaction.error(err);
        });
    }
}

module.exports = listener;
