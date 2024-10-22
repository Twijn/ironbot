const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ModalBuilder, ActionRowBuilder,
    TextInputBuilder, TextInputStyle
} = require("discord.js");

const utils = require("../../utils/");

const command = {
    data: new SlashCommandBuilder()
        .setName("map")
        .setDescription("Commands related to the Adventurers Map")
        .addSubcommand(s => s
            .setName("view")
            .setDescription("View the Adventurer's Map")
        )
        .addSubcommand(s => s
            .setName("setlocation")
            .setDescription("Sets your location on the Adventurer's Map")
            .addStringOption(o => o
                .setName("location")
                .setDescription("The query for location search, for example Madison, WI or London, UK")
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(128)
            )
        )
        .addSubcommand(s => s
            .setName("deletelocation")
            .setDescription("Deletes your location on the Adventurer's Map")
        )
        .setDMPermission(false),
    cache: {},
    /**
     * Executor for this chat command
     * @param {ChatInputCommandInteraction} interaction
     */
    execute: async interaction => {
        const command = interaction.options.getSubcommand(true);
        if (command === "view") {
            const embed = new EmbedBuilder()
                .setTitle("View the Adventurer's Map")
                .setDescription("[Click here to view the Adventurer's Map!](https://www.illumindal.com/map)")
                .setFooter({
                    iconURL: "https://www.illumindal.com/assets/images/icons/illumindal_120px.png",
                    text: "The Illumindal Guild"
                });

            interaction.reply({embeds: [embed], ephemeral: true});
        } else if (command === "setlocation") {
            const discordUser = await utils.Discord.getUserById(interaction.user.id, false, true);
            const identity = await discordUser.createIdentity();

            utils.MapManager.findLocationFromQuery(interaction.options.getString("location", true), identity._id).then(data => {
                const modal = new ModalBuilder()
                    .setCustomId(`set-loc_${data.latlng.latitude.toFixed(7)}_${data.latlng.longitude.toFixed(7)}`)
                    .setTitle("Refine Location Name")
                    .setComponents(
                        new ActionRowBuilder()
                            .setComponents(
                                new TextInputBuilder()
                                    .setCustomId("name")
                                    .setLabel("Name")
                                    .setRequired(true)
                                    .setMinLength(3)
                                    .setMaxLength(128)
                                    .setStyle(TextInputStyle.Short)
                                    .setValue(data.formattedAddress)
                            )
                    );

                interaction.showModal(modal);
            }, err => {
                console.error(err);
                interaction.error(err);
            });
        } else  if (command === "deletelocation") {
            const discordUser = await utils.Discord.getUserById(interaction.user.id, false, true);
            const identity = await discordUser.createIdentity();

            utils.MapManager.deleteLocation(identity._id).then(() => {
                interaction.success("Successfully deleted your location on the Adventurer's Map!");
            }, err => {
                interaction.error(err);
            });
        } else {
            interaction.error("Invalid subcommand!");
        }
    }
}

module.exports = command;