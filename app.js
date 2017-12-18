var rtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
//var my_env = require('node-env-file');
var mongo_poipo = require('./mongodb_poipo');
var commands_poipo = require('./karma_poipo_commands');
var cron_poipo = require('./cron_poipo');
var express = require('express');
var router = require('routes');
var bodyParser = require('body-parser');



/*** Load ENV ***/
//my_env(__dirname+'/.env');
//console.log(process.env.SLACK_API_TOKEN);
/*********************/


var rtm = new rtmClient(process.env.SLACK_API_TOKEN);
//rtm.start();

/*** Listening RTM EVENT from SLACK ***/
let channel_id;
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {

  // Check Team
  mongo_poipo.check_slack_team(rtmStartData.team.id, rtmStartData.team.name);

  // Check Channels
  for (const channel of rtmStartData.channels) {
      if (channel.is_member && !channel.is_archived) {
  		  channel_id = channel.id
        mongo_poipo.check_invited_channels(rtmStartData.team.id, channel);
  	  }
  }

  // Check Team Members
  for(const member of rtmStartData.users) {
     mongo_poipo.check_team_members(rtmStartData.team.id, member);
  }

  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);

  /*** Running cron job at 00:00 ***/
  cron_poipo.give_5_points_cron();
  //cron_poipo.test_everysecond();
});
/***************************************/


// // SKIPPED FOR NOW
// rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, (message) => {
//   //  if(channel_id != 'undefined') {
// 		// rtm.sendMessage("Hello! Semuanya..ehehe...Sy baru OL lagi nih... :)", channel_id);
//   //  }
//   console.log("RTM_CONNECTION_OPENED ");
//   console.log(message);
// });


/*** For detecting message in channel, DM, and GM ***/
rtm.on(RTM_EVENTS.MESSAGE, function(message) {
    console.log("*********** MESSAGE ************");
    console.log(message);
    console.log("*********************************");
    switch(message.channel.charAt(0)) {
      case 'C':
        //Public channel
        // Check message content
        if(message.text.indexOf('<@U8AEJ3DGC> leaderboard') >= 0) { // THIS IS SHOULD BE CHANGED LATER
          // Show top 10 karma point
          console.log("leaderboard detected...");
          mongo_poipo.show_top_10_karma_users_point(rtm, message);

        }else if(message.text.indexOf('thanks <@') >= 0){
          // Check Thanks
          commands_poipo.thanks_filter(rtm, message);
        }
      break;
      case 'D':
        //Direct Message
        if(message.text.indexOf('karma') >= 0) {
              console.log("karma command detected");
              mongo_poipo.get_karma_user_info(rtm, message);
            }
      break;

      case 'G':
        //Group Message:
        console.log("group message detected...");
      break;

      case 'W':
        //Private channel
        console.log("private channel message detected...");
      break;

      default: //Just do nothing
    }

    // Detecting new team member when joining channel
    if(message.hasOwnProperty('subtype') && message.subtype == 'channel_join') {
      mongo_poipo.add_new_invited_member_to_channel(message);
    }

});

/*** For detecting DM ***/
rtm.on(RTM_EVENTS.IM_OPEN, function(message) {
    console.log("IM_OPEN");
    console.log(message);
    console.log(message.text.indexOf('karma'));
    if(message.text.indexOf('karma') >= 0) {
      console.log("karma command detected");
      mongo_poipo.get_karma_user_info(rtm, message);
    }
});


/*** The first time boot/member joined joined the team ***/
rtm.on(RTM_EVENTS.TEAM_JOIN, function(message) {
    console.log("********* TEAM_JOIN *************");
    console.log(message);
});

/*** The first time boot joined a new channel ===== ***/
rtm.on(RTM_EVENTS.CHANNEL_JOINED, function(message) {
    console.log("*************** CHANNEL_JOINED ***************");
    console.log(message);
});


rtm.on(RTM_EVENTS.CHANNEL_LEFT, function(message) {
    console.log("CHANNEL_LEFT");
    console.log(message);
});


rtm.on(RTM_EVENTS.CHANNEL_DELETED, function(message) {
    console.log("CHANNEL_DELETED");
    console.log(message);
});


rtm.on(RTM_EVENTS.CHANNEL_ARCHIVE, function(message) {
    console.log("CHANNEL_ARCHIVE");
    console.log(message);
});


/*** The first time boot/member joined the team ***/
rtm.on(RTM_EVENTS.MEMBER_JOINED_CHANNEL, function(message) {
    console.log("************ MEMBER_JOINED_CHANNEL *************");
    console.log(message);
});


/*** The first time boot/member left a new channel ***/
rtm.on(RTM_EVENTS.MEMBER_LEFT_CHANNEL, function(message) {
    console.log("******** MEMBER_LEFT_CHANNEL**********");
    console.log(message);
});


/*** BOT_ADDED ***/
rtm.on(RTM_EVENTS.BOT_ADDED, function(message) {
    console.log("BOT_ADDED");
    console.log(message);
});



/******************* EXPRESS *********************/
var app = express();
var port = process.env.PORT || 1777;

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));


//Starting server
app.listen(port, function () {
  console.log('Listening on port ' + port);
});


// test route
app.get('/home', function (req, res) {
  //console.log(req);
  //res.writeHead(200, {'Content-TYpe': 'text/html'});
   // res.write(`<h1>Hellow There...</h1><br /><br />Thanks for visiting... :) <br><br>
   //      <a href="https://slack.com/oauth/authorize?scope=bot&client_id=281187440289.284693862498">
   //        <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png"
   //          srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x,
   //          https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
   //      </a>

   //  `);
   //res.write("Hellow write");
    //res.status(200).send('Hello world!');
    res.status(200).send(`<h1>Hellow There...</h1><br /><br />Thanks for visiting... :) <br><br>
         <a href="https://slack.com/oauth/authorize?scope=bot&client_id=281187440289.284693862498">
           <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png"
             srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x,
             https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
        </a>

     `);
    res.end();
  }
);



app.post('/poipo', function (req, res, next) {
  console.log(req.body);
  var userName = req.body.user_name;
  var botPayload = {
    text : 'Hello ' + userName + ', You are using poiposlackbot eeaa'
  };
  // Loop otherwise..
  if (userName !== 'slackbot') {
    return res.status(200).json(botPayload);
  } else {
    return res.status(200).end();
  }
});






