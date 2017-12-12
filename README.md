# slackbot_rtm
playing with slack bot rtm using node.js and mongodb

## Aplication Demo
Please take a look at the video demo for this [link](https://www.youtube.com/watch?v=q8ykUHsANSw)

## Bot Specification
* Bot will check Team Name, Team Channels, and Team Members when the first time bot is installed or authenticated
* Each team member will get 5 points everyday at 00:00 from monday to friday
* Team member can give 1 point to another team member by typing ```thanks @slack_name``` if this team member still have remaining point to give
* Bot can show top 10 users point by using ```@karmabot_poipo leaderboard```
* Team member can get it's total point and remaining point to give by sending DM to bot ```karma```
* Bot only can give a response to a channel where the bot is invited
* Bot will add new Team Channel to mongo database when bot is invited to the channel
* Bot will set ```is_deleted = true``` when bot is kicked from a channel
* Bot will set ```is_deleted = true``` if a team member leaved or is kicked from a channel and this team member has no other channel together with bot
* Bot will set ```is_deleted = true``` when a channel is deleted or archieved

## Database Collection Specification
* Team Collection consists of :
    * _id (automatically added by mongo db)
    * slack_team_id
    * slack_team_name
    * is_deleted (default false)
    
  Data Example
     ```
     {
        "_id": {
            "$oid": "5a2e62a2badb6c23ac1e9eea"
        },
        "slack_team_id": "T895HCY8H",
        "slack_team_name": "poipo"
    }
    ```
    
* Invited Channels Collection consists of :
    * _id (automatically added by mongo db)
    * slack_team_id
    * slack_channel_id
    * slack_channel_name
    * slack_channel_member_ids
    * is_deleted (default false)
    
  Data Example :
    ```
    {
        "_id": {
            "$oid": "5a2e62a1badb6c23ac1e9ee8"
        },
        "slack_team_id": "T895HCY8H",
        "slack_channel_id": "C8C2X1RQF",
        "slack_channel_name": "test_boot",
        "slack_channel_member_ids": [
            "U89MZ4PV2",
            "U8AEJ3DGC"
        ],
        "is_deleted": false
    }
    ```
    
* Channel Team Members Collection consists of :
    * _id (automaticall added by mongo db)
    * slack_id
    * slack_name
    * total_point
    * received_point (this is the received point for today only)
    * given_point (remaining point that can be given. If it's null this user can't give point anymore)
    * slack_team_id (this is used for getting top 10 users karma point)
    * is_deleted (default false)
    
  Data Example :
    ```
    {
        "_id": {
            "$oid": "5a2e62a2badb6c23ac1e9ee9"
        },
        "slack_id": "U89MZ4PV2",
        "slack_name": "Hyosoka",
        "total_point": 90,
        "received_point": 0,
        "given_point": 3,
        "slack_team_id": "T895HCY8H",
        "is_deleted": false
    }
    ```
## Flow Chart
    will be added later.



## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

* Provide a mongo database in [mlab](https://mlab.com/). Please create 3 collection from there and put database and collction info to your .env file

```
MONGODB_USER=your_mongo_user
MONGODB_PASS=your_mongo_password
MONGODB_DATABASE=your_database

MONGODB_COLLECTION_TEAMS=your_mongo_team_collection
MONGODB_COLLECTION_INVITED_CHANNELS=your_mongo_invited_channels_collection
MONGODB_COLLECTION_USERS=your_mongo_user_collection
```
* Provide a slack token from your slack boot. Create slack bot first, then you'll gonna get your api token from [slack](https://poipo.slack.com/services/B8AD8CBR8). Please put this token to .env file also.
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

* TH assignment from [Teleo](https://www.teleo.co/)
* stackoverflow
* Hat tip to anyone who's code was used
* Inspiration
* etc
