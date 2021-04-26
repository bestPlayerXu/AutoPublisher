const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

process.title = 'AutoPublisher';
fs.writeFileSync('logs/pid.log', '' + process.pid);

//not using the process.on('exit') to be able to call async functions
var exit = () => {
	//do whatever necessary before exit
	client.destroy();
	console.log('Destroyed client. now killing myself ...');
	process.exit();
}
process.on('SIGTERM', () => exit());
process.on('SIGINT', () => exit());
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled rejection at ', promise, `reason: ${err.message}`);
});
process.on('uncaughtException', err => {
  console.log(`Uncaught Exception: ${err.message}`);
});

const DBL_API = require('dblapi.js');
const dbl = new DBL_API(process.env.DBL_TOKEN, client);
const dbConnector = new (require('./dbConnector.js'))();
const EmbedCreator = require('./EmbedCreator.js');
const adminCommands = require('./commands/admin.js').sort((a, b) => a.sName < b.sName ? -1 : 1);
const normalCommands = require('./commands/normal.js').sort((a, b) => a.sName < b.sName ? -1 : 1);
adminCommands.forEach(a => a.bAdmin = true);
normalCommands.forEach(a => a.bAdmin = false);

const commands = adminCommands.concat(normalCommands);

dbl.on('posted', () => {
	console.log('Server count posted!');
});


var bestPlayer;

client.on('ready', async () => {
	require('ping-a-monitor')('http://192.168.178.44:1122/AutoPublisher', 600000, () => client.ws.ping, { sendInQuery: true, sendAtStart: true });
	try {
		/*client.api.applications(client.user.id).commands.post({ data: {
			name: 'help',
			description: 'Get some help to get started.'
		}});*/
		client.ws.on('INTERACTION_CREATE', async interaction => {
			if (interaction.data.name !== 'help') return;
			try {
				client.api.interactions(interaction.id, interaction.token).callback.post({
					data: {
						type: 4,
						data: {
							content: 'All I can help you with is to tell you to type `ap!help` into the chat so I can send you the whole help-embed.'
						}
					}
				});
			} catch(e) { console.log(e) }
		});
	} catch (e) { console.log('Catched an error during new Discord interaction: ' + e) }
	setInterval(() => {try { dbl.postStats(client.guilds.cache.size) } catch(e) {console.log(e)}}, 1800000);
	console.log(`Logged in as ${client.user.tag}!`);
	bestPlayer = await client.users.fetch('556593706313187338');
	this.embedCreator = new EmbedCreator(bestPlayer.avatarURL(), client.user.avatarURL(), bestPlayer.tag);
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
	dbConnector.removeGuild(guild.id);
});

var fnGetCommandList = aCommand => aCommand.map(c => `\`${c.sName}\`: ${c.sDescription}`).join('\n');

var fnExecuteCommand = (oCommand, isAdmin, message, param, guild) => {
	if (oCommand.bAdmin && !isAdmin) {
		message.channel.send(this.embedCreator.getShort('You need the `MANAGE_CHANNELS` permission for that.')).catch();
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
			param: param,
			add: id => dbConnector.addAnnouncementChannel(guild.Id, id),
			remove: id => dbConnector.removeAnnouncementChannel(id),
			prefix: prefix => dbConnector.setPrefix(guild.Id, prefix)
		});
		if (!res) {
			return;
		}
		if (typeof res === 'string') {
			message.channel.send(this.embedCreator.getShort(res)).catch();
		} else {
			res.title = oCommand.sName;
			message.channel.send(this.embedCreator.getFull(res)).catch();
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
	var commandlist = normalCommands.map(p => p);
	commandlist.push({ sName: 'Help', sDescription: 'Sends this message.' });
	oHelp.fields.push({
		name: 'Commands',
			value: fnGetCommandList(commandlist)
	});
	oHelp.fields.push({
		name: 'Support Server',
		value: 'If you have questions, join our [support server](https://discord.gg/NYCvrdedWz)'
	});
	message.channel.send(this.embedCreator.getFull(oHelp)).catch();
}

client.on('message', async message => {
	if (message.guild.id === '715549991212548216' && message.content.toLowerCase() === 'good bot') return message.channel.send('Thanks!');
	if (!message.guild || !message.guild.me.permissionsIn(message.channel).has('SEND_MESSAGES')) {
		return;
	}
	var guild = await dbConnector.getGuildById(message.guild.id);
	if (!guild) {
		dbConnector.addGuild(message.guild.id);
		guild = dbConnector.getGuildById(message.guild.id);
	}
	if (message.channel.type === 'news') {
		if (guild.announcements.find(a => a === message.channel.id)) {
			var perm = message.guild.me.permissionsIn(message.channel);
			if (perm.has('SEND_MESSAGES') && perm.has('MANAGE_MESSAGES')) {
				message.crosspost().catch();
			} else {
				message.author.send('In order to auto-publish messages in ' + message.guild.name + ' I need:\n\nboth the `SEND_MESSAGES` permission AND the `MANAGE_MESSAGES` permission.\n\nWithout these Discord won\'t let me publish messages.').catch();
			}
		}
		return;
	}
	if (message.content.startsWith(guild.prefix) && (!message.author.bot || message.author.id === client.user.id)) { //enabled for testing commands
		var command = message.content.substring(guild.prefix.length).split(' ')[0].toLowerCase();
		var param = message.content.split(/ |\n/g);
		param.shift();
		param = param.map(p => p.replace(/<@|<#|>/g, '')).filter(p => p.length !== 0);

		var isAdmin = message.member.hasPermission('MANAGE_CHANNELS') || message.author.id === bestPlayer.id || message.author.bot; //only autopublisher-bot can reach this line
		var oCommand = commands.find(c => c.sName.toLowerCase() === command);
		if (oCommand) {
			fnExecuteCommand(oCommand, isAdmin, message, param, guild);
		} else if (command === 'help') {
			fnSendHelp(isAdmin, message, guild)
		} else {
			message.channel.send(this.embedCreator.getShort('The command `' + command + '` doesn\'t exist.')).catch();
		}
	}
});

client.login(process.env.BOT_TOKEN);
