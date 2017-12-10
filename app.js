var rtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var my_env = require('node-env-file');
var mongo_poipo = require('./mongodb_poipo');
var commands_poipo = require('./karma_poipo_commands');



/*** Load ENV ***/
my_env(__dirname+'/.env');
//console.log(process.env.SLACK_API_TOKEN);
/*********************/


var rtm = new rtmClient(process.env.SLACK_API_TOKEN);
rtm.start();

/*** Listening RTM EVENT from SLACK ***/
let channel_id;
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const channel of rtmStartData.channels) {
      if (channel.is_member && !channel.is_archived) {
  		  channel_id = channel.id
        mongo_poipo.check_invited_channels(channel);
  	  }
  }
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);
});
/***************************************/


// SKIPPED FOR NOW
// rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
//    if(channel_id != 'undefined') {
// 		rtm.sendMessage("Hello! Semuanya..ehehe...Sy baru OL lagi nih... :)", channel_id);
//    }
// });


/*** For detecting message in channel ***/
rtm.on(RTM_EVENTS.MESSAGE, function(message) {
    console.log("MESSAGE");
    console.log(message);
    commands_poipo.thanks_filter(rtm, message);
});

/*** For detecting DM ***/
rtm.on(RTM_EVENTS.IM_OPEN, function(message) {
    console.log("IM_OPEN");
    console.log(message);
});


/*** The first time boot joined a new channel ***/
rtm.on(RTM_EVENTS.CHANNEL_JOINED, function(message) {
    console.log("CHANNEL_JOINED");
    console.log(message);
});


/*** The first time boot/member joined a new channel ***/
rtm.on(RTM_EVENTS.MEMBER_JOINED_CHANNEL, function(message) {
    console.log("MEMBER_JOINED_CHANNEL");
    console.log(message);
});

/*** The first time boot/member joined a new channel ***/
rtm.on(RTM_EVENTS.TEAM_JOIN, function(message) {
    console.log("TEAM_JOIN");
    console.log(message);
});


/*** The first time boot/member left a new channel ***/
rtm.on(RTM_EVENTS.MEMBER_LEFT_CHANNEL, function(message) {
    console.log("MEMBER_LEFT_CHANNEL");
    console.log(message);
});


/*** BOT_ADDED ***/
rtm.on(RTM_EVENTS.BOT_ADDED, function(message) {
    console.log("BOT_ADDED");
    console.log(message);
});


/*** BOT_ADDED ***/
rtm.on(RTM_EVENTS.CHANNEL_ARCHIVE, function(message) {
    console.log("CHANNEL_ARCHIVE");
    console.log(message);
});





//mongo_poipo.get_remain_karma_points(1);


