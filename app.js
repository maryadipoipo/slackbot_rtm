
var commands_poipo = require('./karma_poipo_commands');
var express = require('express');
var router = require('routes');
var bodyParser = require('body-parser');
var url = require('url');



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
app.get('/', function (req, res) {
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

    var url_contents = url.parse(req.url, true);
    if(typeof(url_contents.query.code) != 'undefined') {
      console.log(url_contents.query.code);
      commands_poipo.poipo_oauth_acess(url_contents.query.code);
    }

    //console.log("state : "+url_contents.Url.query.state);

    res.status(200).send(`<h1>Hellow There...</h1><br /><br />Thanks for visiting... :) <br><br>
         <a href="https://slack.com/oauth/authorize?scope=bot&client_id=281187440289.284693862498">
           <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png"
             srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x,
             https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
        </a>

     `);
    console.log("heroku heroku heroku heroku nheroku");
    res.end();
  }
);


app.get('/privacy-policy', function (req, res) {
    res.status(200).send(`<h1>Hellow There...</h1><br /><br />Thanks for visiting... :) <br><br>
         This page is privacy-policy of karmabot_poipo<br><br>
         It's still under development... :)

     `);
    console.log("privacy-policy viewed");
    res.end();
  }
);


app.get('/support', function (req, res) {
    res.status(200).send(`<h1>Hellow There...</h1><br /><br />Thanks for visiting... :) <br><br>
         This page is support page of karmabot_poipo<br><br>
         It's still under development... :)<br>
         So if you have any questions or need any help. Please email me at hyosoka187@gmail.com

     `);
    console.log("privacy-policy viewed");
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






