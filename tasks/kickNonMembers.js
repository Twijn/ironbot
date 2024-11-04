if (process.argv.length < 3) {
    console.error("Expected addRoleToAll {role(s) required}");
    process.exit(1);
}

const requiredRoleIds = process.argv[2].split(",").map(x => x.trim());

const readline = require('readline');

function confirm(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(prompt + " (y/n) ", ans => {
        rl.close();
        if (!ans) {
            return confirm(prompt).then(resolve);
        }
        if (ans.toLowerCase() === "y") {
            resolve();
        } else {
            console.log("Aborting");
            process.exit(0);
        }
    }));
}

const SNOWFLAKE_REGEX = /^\d{16,22}$/;

requiredRoleIds.forEach(role => {
    if (!SNOWFLAKE_REGEX.test(role)) {
        console.error(`Required role ${role} does not look like a snowflake!`);
        process.exit(1);
    }
});

const {Client, GatewayIntentBits, Events} = require("discord.js");

const config = require("../config.json");

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
]});

const error = err => {
    console.error(err);
    process.exit(1);
}

client.on(Events.ClientReady, () => {
    console.log("Logged in to Discord!");

    console.log(`Fetching guild ${config.discord.guild}...`);
    client.guilds.fetch(config.discord.guild).then(async guild => {
        console.log("Fetching roles...");

        let requiredRoles = [];

        try {
            for (const roleId of requiredRoleIds) {
                const role = await guild.roles.fetch(roleId);
                if (!role) {
                    error("Could not find role " + roleId)
                }
                requiredRoles.push(role);
            }
        } catch(err) {
            error(err);
        }

        console.log("Using required roles " + requiredRoles.map(x => x.name).join(", "));

        await confirm("Continue?");

        console.log(`Fetched guild ${guild.id} (${guild.name})!`);
        console.log("Fetching guild members...");
        guild.members.fetch().then(async members => {
            console.log(`Fetched ${members.size} guild members!`)
            console.log("Starting processing...");

            let skipped = 0;

            let membersToKick = [];

            for (const [id, member] of members) {
                let hasRole = false;
                for (const role of requiredRoles) {
                    if (member.roles.cache.has(role.id)) {
                        hasRole = true;
                        break;
                    }
                }

                if (hasRole || member.user.bot) {
                    skipped++;
                } else {
                    membersToKick.push(member);
                }
            }

            console.log(`Skipped ${skipped} members.`);
            console.log(`Members to kick (${membersToKick.length}): ${membersToKick.map(x => `${x.user.username} (${Array.from(x.roles.cache).map(([i,x]) => x.name)})`).join(" | ")}`)

            await confirm("Continue?");

            let kicked = 0;
            let failed = 0;

            for (let i = 0; i < membersToKick.length; i++) {
                const member = membersToKick[i];
                try {
                    await member.kick(`Missing ${requiredRoles.map(x => x.name).join("/")} role`);
                    console.log("Kicked member " + member.user.username)
                    kicked++;
                } catch(err) {
                    console.error("Could not kick member " + member.user.username)
                    console.error(err);
                    failed++;
                }
            }

            console.log(`Completed. Successful: ${kicked} Unsuccessful: ${failed}`);
        });
    }, error);
});

console.log("Logging into Discord...")
client.login(config.discord.token).catch(error);
