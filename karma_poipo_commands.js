var mongo_poipo = require('./mongodb_poipo');
var poipo_request = require('request'),
querystring = require('querystring');

module.exports = {
    thanks_filter: function(i_rtm, obj_message) {
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
    },

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
            console.log("bot id : "_data.bot.bot_user_id);
        });
    }
}
