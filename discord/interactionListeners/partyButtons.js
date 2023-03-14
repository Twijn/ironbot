const {  ButtonInteraction, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle  } = require("discord.js");
const config = require("../../config.json");
const con = require("../../database");

const listener = {
    name: "partyButtons",
    verify: interaction => interaction.isButton() && interaction.customId.startsWith("party-"),
    /**
     * Executor for this listener
     * @param {ButtonInteraction} interaction 
     */
    execute: async interaction => {
        if (!interaction.inGuild()) {
            interaction.error("This must be ran in The Adventures Guild!");
            return;
        }

        if (interaction.customId === "party-interest") {
            con.query("select party_id from party__message where id = ?;", [interaction.message.id], (err, res) => {
                if (!err) {
                    const partyId = res[0].party_id;

                    con.query("select id from party__interest where party_id = ? and user_id = ?;", [partyId, interaction.user.id], async (err2, res2) => {
                        if (!err2) {
                            try {
                                let added = res2.length === 0;
                                if (res2.length > 0) {
                                    await con.pquery("delete from party__interest where id = ?;", [res2[0].id]);
                                } else {
                                    await con.pquery("insert into party__interest (party_id, user_id) values (?, ?);", [partyId, interaction.user.id]);
                                }
    
                                const partySet = await con.pquery("select * from party where id = ?;", [partyId]);
                                const interested = await con.pquery("select id from party__interest where party_id = ?;", [partyId]);

                                if (partySet.length === 0) {
                                    interaction.error("Unable to find party");
                                    return;
                                }
                                
                                const party = partySet[0];
                                const owner = await interaction.guild.members.fetch(party.owner_id);

                                const embed = new EmbedBuilder()
                                    .setTitle(party.name)
                                    .setDescription(party.description)
                                    .setColor(0xf28227)
                                    .setAuthor({
                                        iconURL: owner.displayAvatarURL(),
                                        name: owner.displayName,
                                    })
                                    .setThumbnail(config.party.image_uri + party.image)
                                    .setFooter({
                                        iconURL: interaction.guild.iconURL(),
                                        text: `${interested.length} adventurer${interested.length === 1 ? " is" : "s are"} interested in this party suggestion`,
                                    });
    
                                const button = new ButtonBuilder()
                                    .setCustomId("party-interest")
                                    .setLabel("Interested")
                                    .setEmoji("🔔")
                                    .setStyle(ButtonStyle.Secondary);
        
                                const row = new ActionRowBuilder()
                                    .addComponents(button);
                                
                                interaction.message.edit({embeds: [embed], components: [row]}).catch(console.error);
                                
                                interaction.success(added ? `You are now interested in the party \`${party.name}\`!` : `You are no longer interested in the party \`${party.name}\``);
                            } catch(e) {
                                console.error(e);
                                interaction.error(String(e));
                            }
                        } else {
                            console.error(err2);
                            interaction.error(String(err2));
                        }
                    });
                } else {
                    console.error(err);
                    interaction.error(String(err));
                }
            });
        }
    }
}

module.exports = listener;