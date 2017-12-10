var rtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var my_env = require('node-env-file');
var mongo_poipo = require('./mongodb_poipo');



/*** Load ENV ***/
my_env(__dirname+'/.env');
//console.log(process.env.SLACK_API_TOKEN);
/*********************/


var rtm = new rtmClient(process.env.SLACK_API_TOKEN);

/*** Listening RTM EVENT from SLACK ***/
let channel_id;
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const channel of rtmStartData.channels) {
      if (channel.is_member && !channel.is_archived) {
  		  channel_id = channel.id
        mongo_poipo.check_invited_channels(channel);
  	  }
  }
  //console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);
});
/***************************************/

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
   if(channel_id != 'undefined') {
		rtm.sendMessage("Hello! Semuanya..ehehe...Sy baru OL lagi nih... :)", channel_id);
   }
});


// /*** For detecting message in channel ***/
// rtm.on(RTM_EVENTS.MESSAGE, function(message) {
//     console.log(message);
// });

// /*** For detecting DM ***/
// rtm.on(RTM_EVENTS.IM_OPEN, function(message) {
//     console.log(message);
// });


rtm.start();


//mongo_poipo.get_remain_karma_points(1);


