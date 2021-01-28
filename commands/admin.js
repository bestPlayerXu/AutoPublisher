module.exports = [
	{
		sName: 'Add',
		sHelp: 'The `add` command needs (exactly) _one_ parameter. This parameter can be either the id or the #channel.```e.g.: PREFIXadd #MyAnnouncementChannel```or```e.g.: PREFIXadd 123456789```\nYou can add every channel with `all` as a parameter.```e.g.: PREFIXadd all```',
		sDescription: 'Adds an announcement channel where I can auto-publish messages.',
		fExecute: dataModel => {
			var channel = dataModel.param[0];
			var prefix = dataModel.guild.prefix;
			var announcementChannels = dataModel.client.channels.cache.filter(c => c.guild && c.guild.id === dataModel.message.guild.id && c.type === 'news').map(c => c.id);

			if (announcementChannels.length === 0) {
				return {
					description: 'You need to have announcement channels _first_, before using this bot!',
					fields: [
						{
							name: 'Community Server',
							value: 'You need to be a community server. Become one [here](https://support.discord.com/hc/en-us/articles/360047132851).'
						}, {
							name: 'Announcement Channel',
							value: 'You need announcement channels. Read how to create them [here](https://support.discord.com/hc/en-us/articles/360032008192).'
						}
					]
				}
			}

			if (channel === 'all') {
				var iAnnouncementChannelsBefore = dataModel.guild.announcements.length;
				dataModel.guild.announcements = announcementChannels;
				return 'Added `' + (dataModel.guild.announcements.length - iAnnouncementChannelsBefore) + '` new announcement channels.';
			}

			var c = dataModel.client.channels.cache.get(channel);
			if (c && c.guild.id === dataModel.message.guild.id && c.type === 'news') {
				if (dataModel.guild.announcements.find(a => a === channel)) {
					return 'No need to add channel <#' + channel + '> twice :D';
				}
				dataModel.guild.announcements.push(channel);
				return 'Successfully added announcement channel <#' + channel + '>';
			} else {
				return `<#${channel}> with id ${channel} isn\'t an announcement channel of this server!`;
			}
		}
	}, {
		sName: 'Remove',
		sHelp: 'The `remove` command needs (exactly) _one_ parameter. This parameter can be either the id or the #channel.```e.g.: PREFIXremove #MyAnnouncementChannel```or```e.g.: PREFIXremove 123456789```\nYou can remove every channel with `all` as a parameter.```e.g.: PREFIXremove all```',
		sDescription: 'Removes an announcement channel to not auto-publish messages.',
		fExecute: dataModel => {
			var channel = dataModel.param[0];
			var prefix = dataModel.guild.prefix;

			if (channel === 'all') {
				var iAnnouncementChannels = dataModel.guild.announcements.length;
				dataModel.guild.announcements = [];
				return 'Removed every (`' + iAnnouncementChannels + '`) announcement channel.';
			}

			var c = dataModel.client.channels.cache.get(channel);
			if (c && c.guild.id === dataModel.message.guild.id && c.type === 'news') {
				if (dataModel.guild.announcements.find(a => a === channel)) {
					dataModel.guild.announcements = dataModel.guild.announcements.filter(a => a !== channel);
					return 'Successfully removed announcement channel <#' + channel + '>';
				} else {
					return '<#' + channel + '> isn\'t even an announcement channel I need to auto-publish!';
				}
			} else {
				return '<#' + channel + '> isn\'t an announcement channel of this server!';
			}
		}
	}, {
		sName: 'Setprefix',
		sHelp: 'The current prefix for this server is `PREFIX`.\n\nChange it with this command together with a new prefix.```e.g.: PREFIXsetprefix ap!```\n=> this sets the prefix to `ap!`',
		sDescription: 'Changes the prefix of this server.',
		fExecute: dataModel => {
			if (dataModel.param.length !== 0) {
				dataModel.guild.prefix = dataModel.param[0];
				return 'Set the prefix to `' + dataModel.param[0] + '`.';
			}
			return;
		}
	}
]
