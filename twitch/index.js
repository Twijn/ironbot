const fs = require('node:fs');
const path = require('node:path');
const tmi = require('tmi.js');

const config = require("../config.json");

const client = new tmi.Client({
	options: { debug: true },
	identity: config.twitch.identity,
	channels: config.twitch.channels
});

client.commands = {};

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('name' in command && 'execute' in command) {
		client.commands[command.name] = command;
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "name" or "execute" property.`);
	}
}

client.connect();

client.on('message', (channel, tags, message, self) => {
	// Ignore echoed messages.
	if (self) return;

	if (!message.startsWith(config.twitch.prefix)) return;

	const args = message.slice(1).split(' ');
	const command = args.shift().toLowerCase().replace(config.twitch.prefix, "");

	if (client.commands.hasOwnProperty(command)) {
		try {
			client.reply = message => {
				client.say(channel, `@${tags["display-name"]}, ${message}`)
			}
			client.announce = message => {
				client.say(channel, message);
			}

			const badges = tags.badges || {};
			client.isChatterBroadcaster = badges.broadcaster;
			client.isChatterMod = badges.moderator;
			client.isChatterModUp = client.isChatterBroadcaster || client.isChatterMod;
			
			client.commands[command].execute(args, tags, client);
		} catch (err) {
			console.error(err);
		}
	} else {
		// custom command processing
	}
});
