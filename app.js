var rtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var my_env = require('node-env-file');

/*** Load ENV ***/
my_env(__dirname+'/.env');
//console.log(process.env.SLACK_API_TOKEN);
/*********************/

var rtm = new rtmClient(process.env.SLACK_API_TOKEN);

/*** Listening RTM EVENT from SLACK ***/
let channel;
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
      if (c.is_member && c.name ==='jamiestestchannel') { channel = c.id }
  }
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);
});
/***************************************/



rtm.start();


