const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require("fs");
const mime = require("mime-types");

const {  ModalSubmitInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle  } = require("discord.js");

const config = require("../../config.json");
const api = require("../../api/");
const con = require("../../database");

const FILE_DIRECTORY = "./files/";
const DOWNLOADABLE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

try {
    fs.mkdirSync(FILE_DIRECTORY)
} catch(e) {}

const listener = {
    name: "partyModals",
    verify: interaction => interaction.isModalSubmit() && interaction.customId.startsWith("party-"),
    /**
     * Executor for this listener
     * @param {ModalSubmitInteraction} interaction 
     */
    execute: async interaction => {
        if (!interaction.inGuild()) {
            interaction.error("This must be ran in The Adventures Guild!");
            return;
        }

        if (interaction.customId === "party-suggest") {
            const name = interaction.fields.getTextInputValue("name");
            const description = interaction.fields.getTextInputValue("description");
            const imageUrl = interaction.fields.getTextInputValue("image-url");
            const public = interaction.fields.getTextInputValue("public").toLowerCase() === "true";

            let image;

            if (imageUrl && imageUrl.length > 0) {
                try {
                    let url = new URL(imageUrl);
    
                    if (url.protocol !== "http:" && url.protocol !== "https:") throw "Invalid protocol";
    
                    const result = await fetch(url);
    
                    let type = result.headers.get("Content-Type").toLowerCase();
    
                    if (DOWNLOADABLE_TYPES.includes(type)) {
                        image = con.stringGenerator(32) + (mime.extension(type) ? "." + mime.extension(type) : "");
                        
                        result.body.pipe(fs.createWriteStream(FILE_DIRECTORY + image));
                    } else {
                        throw `Invalid content type: retrieved \`${type}\`, expected \`${DOWNLOADABLE_TYPES.join(", ")}\``;
                    }
                } catch (err) {
                    console.error(err);
                    interaction.error(String(err));
                    return;
                }
            }

            con.query("insert into party (owner_id, name, description, public, image) values (?, ?, ?, ?, ?);", [
                interaction.user.id,
                name,
                description,
                public,
                image ? image : null,
            ], err => {
                if (!err) {
                    con.query("select id from party where owner_id = ? and name = ? order by id desc;", [interaction.user.id, name], (err, res) => {
                        if (!err) {
                            if (res.length > 0) {
                                const partyId = res[0].id;
                                con.query("insert into party__interest (user_id, party_id) values (?, ?);", [interaction.user.id, partyId], err => {
                                    if (err) console.error(err);
                                });

                                global.discord.channels.fetch(config.party.channel.suggest).then(channel => {
                                    const embed = new EmbedBuilder()
                                        .setTitle(name)
                                        .setDescription(description)
                                        .setColor(0xf28227)
                                        .setAuthor({
                                            iconURL: interaction.member.displayAvatarURL(),
                                            name: interaction.member.displayName,
                                        })
                                        .setThumbnail(config.party.image_uri + image)
                                        .setFooter({
                                            iconURL: interaction.guild.iconURL(),
                                            text: "1 adventurer is interested in this party suggestion",
                                        });
            
                                    const button = new ButtonBuilder()
                                        .setCustomId("party-interest")
                                        .setLabel("Interested")
                                        .setEmoji("🔔")
                                        .setStyle(ButtonStyle.Secondary);
            
                                    const row = new ActionRowBuilder()
                                        .addComponents(button);
                                    
                                    channel.send({embeds: [embed], components: [row]}).then(message => {
                                        con.query("insert into party__message (id, party_id, channel_id, type) values (?, ?, ?, 'suggest');", [message.id, partyId, channel.id], err => {
                                            if (err) console.error(err);
                                        });
                                    }, console.error);
                                    
                                    interaction.success("Party topic was successfully suggested!");
                                }, err => {
                                    console.error(err);
                                    interaction.error(err);
                                });
                            }
                        } else {
                            console.error(err);
                            interaction.error(String(err));
                        }
                    });
                } else {
                    console.error(err);
                    interaction.error(String(err));
                }
            });
        } else if (interaction.customId.startsWith("party-deny-")) {
            const id = interaction.customId.replace("party-deny-", "");
            const reason = interaction.fields.getTextInputValue("reason");

            api.getPartyById(id).then(async party => {
                await interaction.deferReply({ephemeral: true});
                party.delete(reason).then(() => {
                    interaction.success("Successfully denied party `" + party.name + "`", true);
                }, err => {
                    console.error(err);
                    interaction.error(String(err), true);
                });
            }, err => {
                console.error(err);
                interaction.error("Unable to find party");
            })
        }
    }
}

module.exports = listener;