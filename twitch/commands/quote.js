const tmi = require("tmi.js");

const con = require("../../database");

const MAXIMUM_QUOTE = 256;
const MAXIMUM_QUOTE_BY = 25;

const formatDate = date => {
    const newDate = new Date(date);
    return `${newDate.getMonth()+1}/${newDate.getDate()}/${newDate.getFullYear()}`
}

const formatQuote = quote => {
    return `#${quote.id}: ${quote.quote}${quote.quoteBy !== null ? " - " + quote.quoteBy : ""}${quote.quoteDate !== null ? " on " + formatDate(quote.quoteDate) : ""}`;
}

const command = {
    name: "quote",
    formatQuote: formatQuote,
    /**
     * 
     * @param {string[]} args 
     * @param {tmi.ChatUserstate} tags 
     * @param {tmi.Client} client 
     */
    execute: async (args, tags, client) => {
        if (args.length === 0) {
            con.query("select * from quote order by rand() limit 1;", (err, res) => {
                if (err) {
                    console.error(err);
                    client.reply("an error occurred while processing this command!");
                    return;
                }

                if (res.length > 0) {
                    const quote = res[0];
                    client.announce(formatQuote(quote));
                } else {
                    client.reply("we couldn't find a quote! Are you sure we have any stored?");
                }
            });
        } else {
            if (args[0].toLowerCase() === "add") {
                if (client.isChatterModUp) {
                    args.shift();
                    const quote = args.join(" ").trim();

                    if (quote.length > MAXIMUM_QUOTE) {
                        client.reply("this quote is too long! maximum characters: " + MAXIMUM_QUOTE);
                        return;
                    }

                    con.query("insert into quote (addedById, addedByUsername, quote) values (?, ?, ?);", [
                        tags["user-id"],
                        tags["display-name"],
                        quote
                    ], err => {
                        if (err) {
                            console.error(err);
                            client.reply("an error occurred while processing this command!");
                            return;
                        }

                        con.query("select * from quote where addedById = ? and addedByUsername = ? and quote = ? order by id desc limit 1;", [
                            tags["user-id"],
                            tags["display-name"],
                            quote
                        ], (err2, res) => {
                            if (err2) {
                                console.error(err2);
                                client.reply("an error occurred while processing this command!");
                                return;
                            }

                            if (res.length > 0) {
                                client.announce("Added: " + formatQuote(res[0]));
                            } else {
                                client.reply("failed to retrieve added quote");
                            }
                        });
                    });
                }
            } else if (args[0].toLowerCase() === "setby"
                || args[0].toLowerCase() === "set-by"
                || args[0].toLowerCase() === "by") {
                
                if (client.isChatterModUp) {
                    args.shift();
                    if (args.length >= 2) {
                        const id = args.shift();
                        con.query("select * from quote where id = ?;", [id], (err, quoteRes) => {
                            if (err) {
                                console.error(err);
                                client.reply("an error occurred while processing this command!");
                                return;
                            }

                            if (quoteRes.length > 0) {
                                let quoteBy = args.join(" ").trim();

                                if (quoteBy.length > MAXIMUM_QUOTE_BY) {
                                    client.reply("this speaker is too long! maximum characters: " + MAXIMUM_QUOTE_BY);
                                    return;
                                }

                                con.query("update quote set quoteBy = ? where id = ?;", [
                                    quoteBy,
                                    id,
                                ], err2 => {
                                    if (err2) {
                                        console.error(err2);
                                        client.reply("an error occurred while processing this command!");
                                    } else {
                                        client.reply(`updated quote #${id}: speaker is ${quoteBy}`);
                                    }
                                });
                            } else {
                                client.reply("could not find quote with ID " + id);
                            }
                        });
                    }
                }
            } else if (args[0].toLowerCase() === "set"
                || args[0].toLowerCase() === "edit") {
                
                if (client.isChatterModUp) {
                    args.shift();
                    if (args.length >= 2) {
                        const id = args.shift();
                        con.query("select * from quote where id = ?;", [id], (err, quoteRes) => {
                            if (err) {
                                console.error(err);
                                client.reply("an error occurred while processing this command!");
                                return;
                            }

                            if (quoteRes.length > 0) {
                                let quote = args.join(" ").trim();

                                if (quote.length > MAXIMUM_QUOTE) {
                                    client.reply("this speaker is too long! maximum characters: " + MAXIMUM_QUOTE);
                                    return;
                                }

                                con.query("update quote set quote = ? where id = ?;", [
                                    quote,
                                    id,
                                ], err2 => {
                                    if (err2) {
                                        console.error(err2);
                                        client.reply("an error occurred while processing this command!");
                                    } else {
                                        client.reply(`updated quote #${id}: quote is ${quote}`);
                                    }
                                });
                            } else {
                                client.reply("could not find quote with ID " + id);
                            }
                        });
                    }
                }
            } else if (!isNaN(Number(args[0]))) {
                con.query("select * from quote where id = ?;", [args[0]], (err, res) => {
                    if (err) {
                        console.error(err);
                        client.reply("an error occurred while processing this command!");
                        return;
                    }
    
                    if (res.length > 0) {
                        const quote = res[0];
                        client.announce(formatQuote(quote));
                    } else {
                        client.reply("could not find quote with ID " + args[0]);
                    }
                });
            } else {
                client.reply("invalid function!");
            }
        }
    }
}

module.exports = command;