process.title = 'TAutoPublisher';
require('express')().listen(35412, () => console.log('testing begins'));

const fs = require('fs');
const client = new (require('discord.js')).Client();

var c = client.channels.cache.get(process.env.TEST_SPAM_CHANNEL);

var test = async () => {
	var c = client.channels.cache.get(process.env.TEST_SPAM_CHANNEL);

        await c.send('ap!remove all');
        await c.send('ap!add all');
        await c.send('ap!setprefix ap!');
        await c.send('ap!about');
        await c.send('ap!invite');
        await c.send('ap!ping');
        await c.send('ap!prefix');
        await c.send('ap!view');
        await c.send('ap!help');
        await c.send('ap!uptime');
        await c.send('Tests done!');

	console.log('New test at ' + new Date(Date.now()).toTimeString());
	setTimeout(test, 3600000);
}

var uptime = async() => {
	var c = client.channels.cache.get(process.env.TEST_SPAM_CHANNEL);

	await c.send('ap!ping');
	c.awaitMessages(msg => msg.author.id === client.user.id, { max: 1, time: 30000, errors: [ 'time' ] }).then(collected => {
		var ping = collected.first().embeds[0].description.match(/([0-9]+)/g);
		var latency = ping[0];
		var api = ping[1];
		fs.appendFileSync('logs/up.time', '\n' + [ Date.now(), latency, api].join(' '));
	}).catch(() => {
		fs.appendFileSync('logs/up.time', '\n' + Date.now());
	});
	setTimeout(uptime, 600000);
}

client.on('ready', async () => {
	await test();
	uptime();
});

client.login(process.env.BOT_TOKEN)
