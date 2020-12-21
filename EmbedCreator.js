class EmbedCreator {
	EmbedCreator(bestPlayerAvatar, botAvatar) {
		this.bestPlayerAvatar = bestPlayerAvatar;
		this.botAvatar = botAvatar;
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
					text: 'Made by bestPlayer_xu#0702',
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