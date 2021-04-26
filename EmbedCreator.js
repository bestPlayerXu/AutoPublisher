class EmbedCreator {
	constructor(bestPlayerAvatar, botAvatar, bestPlayerName) {
		this.bestPlayerAvatar = bestPlayerAvatar;
		this.botAvatar = botAvatar;
		this.bestPlayerName = bestPlayerName;
	}

	getFull(embedObject) {
		return {
			embed: {
				color: 0x0000FF,
				title: embedObject.title,
				author: {
					name: 'Auto Publisher discord bot',
					icon_url: this.botAvatar,
					url: 'https://top.gg/bot/778256454914015245'
				},
				description: embedObject.description,
				fields: embedObject.fields,
				footer: {
					text: 'Made by ' + this.bestPlayerName,
					icon_url: this.bestPlayerAvatar
				}
			}
		}
	}

	getShort(description) {
		return {
			embed: {
				color: 0x0000FF,
				description: description
			}
		}
	}
}

module.exports = EmbedCreator;
