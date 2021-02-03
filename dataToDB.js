var data = JSON.parse(require('fs').readFileSync('data'));
var dbConnector = new (require('./dbConnector.js'))();

var a = () => Object.keys(data).forEach(async (k, i) => await dbConnector.addGuild(k, Object.values(data)[i].prefix));
var b = () => Object.values(data).forEach(async (a, i) => await a.announcements.forEach(a => dbConnector.addAnnouncementChannel(Object.keys(data)[i], a)));
setTimeout(() => b(), 100); //do a first then b
