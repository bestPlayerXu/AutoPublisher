process.title = 'AutoPublisherT';
require('express')().listen(35412, () => console.log('testing begins'));

const client = new (require('discord.js')).Client();

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

client.on('ready', () => {
	test();
});

client.login(process.env.BOT_TOKEN)
