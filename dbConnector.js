const mariadb = require('mariadb/callback');

class dbConnector {
	constructor() {
		this.connection = mariadb.createConnection({
			user: process.env.MARIADB_USERNAME,
			password: process.env.MARIADB_PASSWORD,
			database: 'AutoPublisherDiscordBot'
		});
		setInterval(() => this.connection.query('SELECT 0;'), 3600000);
	}
	
	addGuild(id, prefix) {
		this.connection.query('REPLACE INTO Guild VALUES (?,?)', [id, prefix || 'ap!'], () => this.connection.commit());
	}
	
	addAnnouncementChannel(guildId, channelId) {
		this.connection.query('INSERT INTO AnnouncementChannel VALUES (?,?)', [channelId, guildId], () => this.connection.commit());
	}
	
	getGuildById(id) {
		return new Promise(r => {
			this.connection.query('SELECT g.Id as Id, g.Prefix as prefix FROM Guild as g where g.Id = ' + id, (err, res) => {
				this.connection.query('SELECT a.Id FROM AnnouncementChannel as a where a.GuildId = ' + id, (err2, res2) => {
					if (!res|| !res[0]) {
						r(null);
					} else {
						res[0].announcements = res2.map(r => r.Id) || [];
						r(res[0]);
					};
				});
			});
		});
	}
	
	removeAnnouncementChannel(id) {
		this.connection.query('DELETE FROM AnouncementChannel WHERE Id = ' + id, () => {
			this.connection.commit();
		});
	}
	
	removeGuild(id) {
		this.connection.query('DELETE FROM Guild WHERE Id = ' + id, () => this.connection.commit());
	}
	
	setPrefix(guildId, prefix) {
		this.getGuildById(guildId).then(guild => {
			this.addGuild(guildId, prefix);
		});
	}
}
module.exports = dbConnector;
