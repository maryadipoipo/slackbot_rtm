var rtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var mongo_poipo = require('./mongodb_poipo');
var cron_poipo = require('./cron_poipo');
var poipo_request = require('request'),
querystring = require('querystring');


function initialize_rtm(bot_token){

    var rtm = new rtmClient(bot_token);

    /*** Listening RTM EVENT from SLACK ***/
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

    /*** For detecting message in channel, DM, and GM ***/
    rtm.on(RTM_EVENTS.MESSAGE, function(message) {
        console.log("*********** MESSAGE ************");
        console.log(message);
        console.log("*********************************");
        switch(message.channel.charAt(0)) {
          case 'C':
            //Public channel
            // Check message content
            if(message.text.indexOf('<@U8C5EHQ4R> leaderboard') >= 0) { // THIS IS SHOULD BE CHANGED LATER
              // Show top 10 karma point
              console.log("leaderboard detected...");
              mongo_poipo.show_top_10_karma_users_point(rtm, message);

            }else if(message.text.indexOf('thanks <@') >= 0){
              // Check Thanks
              thanks_filter(rtm, message);
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


    // // SKIPPED FOR NOW
    // rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, (message) => {
    //   //  if(channel_id != 'undefined') {
    //      // rtm.sendMessage("Hello! Semuanya..ehehe...Sy baru OL lagi nih... :)", channel_id);
    //   //  }
    //   console.log("RTM_CONNECTION_OPENED ");
    //   console.log(message);
    // });



    rtm.start();
    console.log("......RTM STARTED....");
};

function thanks_filter (i_rtm, obj_message){
    var arr = [];
    var raw_names = obj_message.text.split("thanks <@");

    raw_names.forEach(function (item){
        var temp = item.split(" ");
        console.log("temp : "+temp);
        var temp1 = item.split(">");
        console.log("temp1 : "+temp1);
        if(temp1[0].length > 3) {
            // Check invited_channel first
            console.log("thanked slack id : "+temp1[0]);
            mongo_poipo.handle_thanks_filter_mongo(i_rtm, obj_message, temp1[0]);
        }
    });
};


module.exports = {
    poipo_oauth_acess: function(i_code) {
        var m_body = {
            client_id : process.env.SLACK_CLIENT_ID,
            client_secret: process.env.SLACK_CLIENT_SECRET,
            code:i_code
        };

        console.log("m_body : ");
        console.log(m_body);

        var m_body_form_data = querystring.stringify(m_body);
        poipo_request({
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                //'Authorization' : 'Bearer '+process.env.SLACK_LEGACY_TOKEN
            },
            body: m_body_form_data,
            uri:'https://slack.com/api/oauth.access',
            method:'post'
        }, function(err, res, body){
            var data = JSON.parse(body, true);
            console.log("response body : ");
            console.log(data);

            console.log("Team Name : "+ data.team_name);
            console.log("Team Name : "+ data.team_name);
            console.log("bot id : "+data.bot.bot_user_id);

            initialize_rtm(data.bot.bot_access_token);
        });
    }
}
