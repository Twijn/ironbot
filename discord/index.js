const fs = require('node:fs');
const fspath = require('node:path');

const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates] });

// create collections
client.commands = new Collection();
client.interactionListeners = new Collection();
client.memberJoinListeners = new Collection();
client.memberReadyListeners = new Collection();
client.voiceStateListeners = new Collection();

// populate collections

/**
 * 
 * @param {string} folderName 
 * @param {Collection} collection 
 * @param {function} requiredProps 
 * @param {function} getName 
 */
const populate = (folderName, collection, requiredProps, getName) => {
	const path = fspath.join(__dirname, folderName);
	const files = fs.readdirSync(path).filter(file => file.endsWith('.js'));
	
	for (const file of files) {
		const filePath = fspath.join(path, file);
		const listener = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if (requiredProps(listener)) {
			collection.set(getName(listener), listener);
		} else {
			console.error(`[WARNING] The command at ${filePath} is missing a required property.`);
		}
	}
}

populate("commands", client.commands, x => 'data' in x && 'execute' in x, x => x.data.name);
populate("interactionListeners", client.interactionListeners, x => 'name' in x && 'verify' in x && 'execute' in x, x => x.name);
populate("memberJoinListeners", client.memberJoinListeners, x => 'name' in x && 'execute' in x, x => x.name);
populate("memberReadyListeners", client.memberReadyListeners, x => 'name' in x && 'execute' in x, x => x.name);
populate("voiceStateListeners", client.voiceStateListeners, x => 'name' in x && 'execute' in x, x => x.name);

// ready message
client.once(Events.ClientReady, c => {
	console.log(`Discord ready! Logged in as ${c.user.tag}`);
	console.log(`Startup completed!`);
});

// interaction listener
client.on(Events.InteractionCreate, interaction => {
	interaction.success = message => {
		interaction.reply({
			embeds: [new EmbedBuilder().setTitle("Successful!").setColor(0x2dce3d).setDescription(message)],
			ephemeral: true,
		});
	}
	interaction.error = message => {
		interaction.reply({
			embeds: [new EmbedBuilder().setTitle("An error occurred!").setColor(0xd63939).setDescription(message)],
			ephemeral: true,
		});
	}

    client.interactionListeners.forEach(listener => {
		try {
			if (listener.verify(interaction)) listener.execute(interaction);
		} catch (err) {
			console.error(err);
		}
	});
});

// join listener
client.on(Events.GuildMemberAdd, member => {
    client.memberJoinListeners.forEach(listener => {
		try {
			listener.execute(member);
		} catch (err) {
			console.error(err);
		}
	});
});

// update listener
client.on(Events.GuildMemberUpdate, (old, member) => {
	if (old.pending === null || member.pending === null) return;
	
	if (old.pending && !member.pending) {
		client.memberReadyListeners.forEach(listener => {
			try {
				listener.execute(member);
			} catch (err) {
				console.error(err);
			}
		});
	}
});

global.discord = client;

client.login(config.discord.token);

require("./postSlashCommands");
