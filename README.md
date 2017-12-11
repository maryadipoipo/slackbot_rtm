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

A step by step series of examples that tell you have to get a development env running

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone who's code was used
* Inspiration
* etc
