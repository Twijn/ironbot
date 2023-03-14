const con = require("../database");
const Cache = require("./Cache/Cache");
const Party = require("./Party/Party");

const config = require("../config.json");

class API {

    /**
     * Cache for parties
     * @type {Cache}
     */
    partyCache = new Cache(600000);

    /**
     * Gets a Party by its ID
     * @param {number} id
     * @returns {Promise<Party>}
     */
    getPartyById(id) {
        return this.partyCache.get(id, (resolve, reject) => {
            con.query("select * from party where id = ?;", [id], async (err, res) => {
                if (!err) {
                    if (res.length > 0) {
                        let party = res[0];
                        let guild = await global.discord.guilds.fetch(config.discord.guild);
                        try {
                            resolve(new Party(
                                party.id,
                                party.name,
                                party.description,
                                await global.discord.users.fetch(party.owner_id),
                                party.category_id ? await global.discord.channels.fetch(party.category_id) : null,
                                party.role_mod_id ? await guild.roles.fetch(party.role_mod_id) : null,
                                party.role_user_id ? await guild.roles.fetch(party.role_user_id) : null,
                                party.image,
                                party.public == 1,
                                party.active == 1
                            ))
                        } catch(e) {
                            reject(e);
                        }
                    } else {
                        reject("Party not found");
                    }
                } else {
                    reject(err);
                }
            });
        });
    }

}

module.exports = new API();