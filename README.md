# slackbot_rtm
playing with slack bot rtm using node.js and mongodb

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

* Provide a mongo database in [mlab](https://mlab.com/). Please create 3 collection from there and put database and collction info to your .env

```
MONGODB_USER=your_mongo_user
MONGODB_PASS=your_mongo_password
MONGODB_DATABASE=your_database

MONGODB_COLLECTION_TEAMS=your_mongo_team_collection
MONGODB_COLLECTION_INVITED_CHANNELS=your_mongo_invited_channels_collection
MONGODB_COLLECTION_USERS=your_mongo_user_collection
```
* Provide a slack token from your slack boot. Create slack bot first, then you'll gonna get your api token from [slack](https://poipo.slack.com/services/B8AD8CBR8). Please put this token to .env also.
```
SLACK_API_TOKEN=xoxb-your_slack_api_token
```


### Installing

* Download or fork or whatever you can to take this code to your local development
* Run ```npm i``` for installing dependecines
* Just wait until it finish ehehe

## Running the code

```npm start``` or ```node app```

## Deployment

Planned to deploy to [zeit](https://zeit.co/now) & [heroku](https://dashboard.heroku.com)

## Built With

* [Node.js](https://nodejs.org/en/) - Main programming languange
* [MongoDB](https://www.mongodb.com/) - Database

## Versioning

Using git (source tree or gitbash)

## Authors

* **Hyosoka Poipo** - *Initial work* - [slackbot](https://github.com/slackbot1) & [slack_api_test](https://github.com/HyosokaPoipo/slack_api_test)

See also the list of [contributors](https://github.com/HyosokaPoipo/slackbot_rtm/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://opensource.org/licenses/MIT) file for details

## Acknowledgments

* TH assignment from [Teleo](www.teleo.co)
* stackoverflow
* Hat tip to anyone who's code was used
* Inspiration
* etc
