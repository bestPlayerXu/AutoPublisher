const express = require('express');
const app = express();
const port = 3000;


app.listen(port, () => console.log(`Example app listening at port ${port}`));
app.get('/', (req, res) => res.sendStatus(200));

const Discord = require('discord.js');
const client = new Discord.Client();
//POPS: order
const fs = require('fs');
const DBL_API = require('dblapi.js');
const dbl = new DBL_API(process.env.DBL_TOKEN, client);
//POPS: embed.js? adminCommands?
const embedCreator = require('./embedCreator.js');
const adminCommands = require('./commands/admin.js');
const normalCommands = require('./commands/normal.js');
adminCommands.forEach(a => a.bAdmin = true);
normalCommands.forEach(a => a.bAdmin = false);

const commands = adminCommands.concat(normalCommands);

dbl.on('posted', () => {
	console.log('Server count posted!');
});

//POPS: data.json
var data = JSON.parse(fs.readFileSync('data'));
console.log(data);

client.on('ready', async () => {
	setInterval(() => dbl.postStats(client.guilds.cache.size), 1800000);
	console.log(`Logged in as ${client.user.tag}!`);
	this.bestPlayer = await client.users.fetch('556593706313187338');
	//POPS: constructor
	this.embedCreator = new embedCreator(this.bestPlayer.avatarURL(), client.user.avatarURL());
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

var fnGetCommandList = aCommand => aCommand.map(c => `\`$c.sName}\`: ${ac.sDescription}`).join('\n');

client.on('message', async message => {
	var guild = data[message.guild.id];
	if (!guild) {
		data[message.guild.id] = {
			announcements: [],
			prefix: 'ap!'
		};
		guild = data[message.guild.id];
		fs.writeFileSync('data', JSON.stringify(data, null, 2))
		//POPS: data.json
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
	//POPS: commands
	if (message.content.startsWith(guild.prefix) && !message.author.bot) {
		var command = message.content.substring(guild.prefix.length).split(' ')[0].toLowerCase();
		var param = message.content.split(/ |\n/g);
		param = param.shift().map(p => p.replace(/<@|<#|>/g, '')).filter(p => p.length !== 0);

		var isAdmin = message.member.hasPermission('MANAGE_CHANNELS') || message.author.id === this.bestPlayer.id;
		var oCommand = commands.find(c => c.sName.toLowerCase() === command);
		//POPS: control structure
		if (oCommand) {
				//POPS: executeCommand
			if (oCommand.bAdmin && !isAdmin) {
				//POPS: do not overload
				message.channel.send(this.embedCreator.getShort('You need the `MANAGE_CHANNELS` permission for that.'));
			} else {
				if (!param[0] && oCommand.sHelp) {
					message.channel.send(this.embedCreator.getFull({ description: oCommand.sHelp.replace(/PREFIX/g, guild.prefix), title: oCommand.sName }));
				} else if (oCommand.fExecute) {
					var res = oCommand.fExecute({
						guild: guild,
						message: message,
						client: client,
						//POPS: redundancy?
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
			}
			return;
		}
		if (command === 'help') {
			//POPS: consistency
			var oHelp = { title: 'Help', fields: [] };
			oHelp.fields.push({
				name: 'Prefix',
				value: 'The prefix is `' + guild.prefix + '`'
			});
			if (isAdmin) {
				oHelp.fields.push({
					name: 'Admin commands',
					//POPS: redundancy
					value: fnGetCommandList(adminCommands)
				});
			}
			oHelp.fields.push({
				name: 'Commands',
					value: fnGetCommandList(normalCommands)
			});
			oHelp.fields.push({
				name: 'Support Server',
				value: 'If you have questions, join our [support server](https://discord.gg/NYCvrdedWz)'
			});
			message.channel.send(this.embedCreator.getFull(oHelp));
		} else {
			message.channel.send(this.embedCreator.getShort('The command `' + command + '` doesn\'t exist.'));
		}
	}
});

client.login(process.env.BOT_TOKEN);