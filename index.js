const express = require('express');
const app = express();
const port = 5739;
const startTime = Date.now();


app.listen(port, () => console.log(`Example app listening at port ${port} so kill it with that port.`));

process.title = 'AutoPublisher';

const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const DBL_API = require('dblapi.js');
const dbl = new DBL_API(process.env.DBL_TOKEN, client);
const EmbedCreator = require('./EmbedCreator.js');
const adminCommands = require('./commands/admin.js').sort((a, b) => a.sName < b.sName ? -1 : 1);
const normalCommands = require('./commands/normal.js').sort((a, b) => a.sName < b.sName ? -1 : 1);
adminCommands.forEach(a => a.bAdmin = true);
normalCommands.forEach(a => a.bAdmin = false);

const commands = adminCommands.concat(normalCommands);

dbl.on('posted', () => {
	console.log('Server count posted!');
});

var data = JSON.parse(fs.readFileSync('data'));

var bestPlayer_xu;

client.on('ready', async () => {
	setInterval(() => dbl.postStats(client.guilds.cache.size), 1800000);
	console.log(`Logged in as ${client.user.tag}!`);
	bestPlayer = await client.users.fetch('556593706313187338');
	this.embedCreator = new EmbedCreator(bestPlayer.avatarURL(), client.user.avatarURL());
	client.user.setPresence({
			activity: { 
					name: 'ap!help',
					type: 'LISTENING'
			},
			status: 'online'
	});
	client.user.setUsername('Auto Publisher');
});

client.on('guildDelete', guild => {
	delete data[guild.id];
	fs.writeFileSync('data', JSON.stringify(data, null, 2));
});

var fnGetCommandList = aCommand => aCommand.map(c => `\`${c.sName}\`: ${c.sDescription}`).join('\n');

var fnExecuteCommand = (oCommand, isAdmin, message, param, guild) => {
	if (oCommand.bAdmin && !isAdmin) {
		message.channel.send(this.embedCreator.getShort('You need the `MANAGE_CHANNELS` permission for that.'));
		return;
	}
	if (!param[0] && oCommand.sHelp) {
		message.channel.send(this.embedCreator.getFull({ description: oCommand.sHelp.replace(/PREFIX/g, guild.prefix), title: oCommand.sName }));
		return;
	}
	if (oCommand.fExecute) {
		var res = oCommand.fExecute({
			guild: guild,
			message: message,
			client: client,
			param: param
		});
		if (!res) {
			return;
		}
		if (oCommand.bAdmin) {
			fs.writeFileSync('data', JSON.stringify(data, null, 2));
		}
		if (typeof res === 'string') {
			message.channel.send(this.embedCreator.getShort(res));
		} else {
			res.title = oCommand.sName;
			message.channel.send(this.embedCreator.getFull(res));
		}
	}
};

var fnSendHelp = (isAdmin, message, guild) => {
	var oHelp = { title: 'Help', fields: [] };
	oHelp.fields.push({
		name: 'Prefix',
		value: 'The prefix is `' + guild.prefix + '`'
	});
	if (isAdmin) {
		oHelp.fields.push({
			name: 'Admin commands',
			value: fnGetCommandList(adminCommands)
		});
	}
	oHelp.fields.push({
		name: 'Commands',
			value: fnGetCommandList(normalCommands.map(p => p).push({ sName: 'Help', sDescription: 'Sends this message' }).push({ sName: 'Uptime', sDescription: 'Shows the uptime of the bot in seconds' }))
	});
	oHelp.fields.push({
		name: 'Support Server',
		value: 'If you have questions, join our [support server](https://discord.gg/NYCvrdedWz)'
	});
	message.channel.send(this.embedCreator.getFull(oHelp));
}

client.on('message', async message => {
	var guild = data[message.guild.id];
	if (!guild) {
		data[message.guild.id] = {
			announcements: [],
			prefix: 'ap!'
		};
		guild = data[message.guild.id];
		fs.writeFileSync('data', JSON.stringify(data, null, 2))
	}
	if (message.channel.type === 'news') {
		if (guild.announcements.find(a => a === message.channel.id)) {
			var perm = message.guild.me.permissionsIn(message.channel);
			if (perm.has('SEND_MESSAGES') && perm.has('MANAGE_MESSAGES')) {
				message.crosspost().catch();
			} else {
				message.author.send('In order to auto-publish messages in ' + message.guild.name + ' I need:\n\nboth the `SEND_MESSAGES` permission AND the `MANAGE_MESSAGES` permission.\n\nWithout these Discord won\'t let me publish messages.');
			}
		}
		return;
	}
	if (message.content.startsWith(guild.prefix) && !message.author.bot) {
		var command = message.content.substring(guild.prefix.length).split(' ')[0].toLowerCase();
		var param = message.content.split(/ |\n/g);
		param.shift();
		param = param.map(p => p.replace(/<@|<#|>/g, '')).filter(p => p.length !== 0);

		var isAdmin = message.member.hasPermission('MANAGE_CHANNELS') || message.author.id === bestPlayer.id;
		var oCommand = commands.find(c => c.sName.toLowerCase() === command);
		if (oCommand) {
			fnExecuteCommand(oCommand, isAdmin, message, param, guild);
		} else if (command === 'help') {
			fnSendHelp(isAdmin, message, guild)
		} else if (command === 'uptime') {
			message.channel.send(this.embedCreator.getShort('Bot up for `' + (Date.now() - startTime) + '` seconds.'));
		} else {
			message.channel.send(this.embedCreator.getShort('The command `' + command + '` doesn\'t exist.'));
		}
	}
});

client.login(process.env.BOT_TOKEN);
