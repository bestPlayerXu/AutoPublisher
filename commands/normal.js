module.exports = [
  {
    sName: 'About',
    sDescription: 'Get more info about this bot.',
    fExecute: dataModel => {
      return {
        description: 'This is a **bot** that **auto-publishes every message** in an **announcement channel** by either a **bot or a user**.\n\nMight be useful if a bot can\'t publish messages in your announcement channel, either because the bot can\'t do it or you have to pay money.\n',
        fields: [{
          name: 'Invite the bot!',
          value: '[Discord Bot Invite](https://discord.com/oauth2/authorize?client_id=778256454914015245&permissions=93184&scope=bot)'
        }, {
          name: 'Vote for the bot!',
          value: '[Vote here](https://top.gg/bot/778256454914015245/vote)',
          inline: true
        }, {
          name: 'Join the support server!',
          value: '[Join here!](https://discord.gg/NYCvrdedWz)'
        }]
      }
    }
  }, {
    sName: 'Ping',
    sDescription: 'Get the ping of this bot.',
    fExecute: dataModel => {
      return `🏓Latency is ${Date.now() - dataModel.message.createdTimestamp}ms. API Latency is ${Math.round(dataModel.client.ws.ping)}ms`;
    }
  }, {
    sName: 'View',
    sDescription: 'View announcement channels + check if I have enough permissions',
    fExecute: dataModel => {
      var channels = dataModel.guild.announcements.map(a => {
        var ownedPermissions = dataModel.message.guild.me.permissionsIn(dataModel.client.channels.cache.get(a));
        var neededPermissions = [ 'READ_MESSAGES', 'SEND_MESSAGES', 'MANAGE_MESSAGES' ];
        var sDetail;
        if (ownedPermissions.has('VIEW_CHANNEL')) {
          neededPermissions = neededPermissions.filter(p => !p.startsWith('R'));
        }
        if (ownedPermissions.has('SEND_MESSAGES')) {
          neededPermissions = neededPermissions.filter(p => !p.startsWith('S'));
        }
        if (ownedPermissions.has('MANAGE_MESSAGES')) {
          neededPermissions = neededPermissions.filter(p => !p.startsWith('M'));
        }
				var hasEnoughPermissions = permstring.length === 0;
        if (permstring.length > 0) {
          sDetail = '(needs: ' + permstring.map(p => '`' + p + '`').join(', ') + ' permissions)';
        }
        return { iID: a, iStatus: iStatus, sDetail: sDetail };
      });
      var workingChannels = channels.filter(c => c.iStatus === 2);
      var notWorkingChannels = channels.filter(c => c.iStatus === 4);
      var fields = [];
      if (workingChannels.length > 0) {
        fields.push({
          name: 'Working auto-publishing channels',
          value: workingChannels.map(a => ':white_check_mark:<#' + a.iID + '>')
        });
      }
      if (notWorkingChannels.length > 0) {
        fields.push({
          name: 'Channels that lack permissions => no auto-publish',
          value: notWorkingChannels.map(a => ':x:<#' + a.iID + '>' + a.sDetail)
        });
      }
			if (dataModel.guild.announcements.length === 0) {
				fields.push({
					name: 'No channel added :(',
					value: 'Add a channel with the `add` command!'
				});
			}
      return {
        fields: fields
      };
    }
  }, {
    sName: 'Prefix',
    sDescription: 'See the current prefix.',
    sHelp: 'The current prefix for this server is `PREFIX`.\n\nChange it with the `setprefix`` command together with a new prefix.```e.g.: PREFIXsetprefix ap!```\n=> this sets the prefix to `ap!`'
  }, {
    sName: 'Invite',
    sDescription: 'Get an invite for this bot.',
    sHelp: 'Invite me [here.](https://discord.com/oauth2/authorize?client_id=778256454914015245&permissions=93184&scope=bot)'
  }
]