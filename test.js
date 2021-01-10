const client = new (require('discord.js')).Client();

client.on('ready', async () => {
	var c = client.channels.cache.get('797712333635846175');
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
	client.destroy();
});

client.login(process.env.BOT_TOKEN);
