var my_env = require('node-env-file');
var MongoClient = require('mongodb').MongoClient;

my_env(__dirname+'/.env');
var url = "mongodb://"
          +process.env.MONGODB_USER
          +":"
          +process.env.MONGODB_PASS
          +"@ds129936.mlab.com:29936/"
          +process.env.MONGODB_DATABASE;

function add_new_invited_channel (dbase, slack_team_id, new_obj_channel) {
    var new_channel_data = {
        slack_team_id : slack_team_id,
        slack_channel_id : new_obj_channel.id,
        slack_channel_name : new_obj_channel.name,
        slack_channel_member_ids : new_obj_channel.members,
        is_deleted: false
    };
    dbase.collection(process.env.MONGODB_COLLECTION_INVITED_CHANNELS)
        .insertOne(new_channel_data, function(err, res) { //insertOne buat 1 object
              if (err) throw err;
              console.log("new invited channel inserted successfully : "+new_obj_channel.id);
        });
}

function give_and_update_5_points(obj_member) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;

        var query = {slack_id: obj_member.slack_id};
        var new_point = {
            slack_id: obj_member.slack_id,
            slack_name: obj_member.slack_name,
            total_point: obj_member.total_point,
            received_point: 0, // reset to null again because it's a new day
            given_point: 5,
            slack_team_id: obj_member.slack_team_id,
            is_deleted: obj_member.is_deleted
        };
        var dbase = db.db(process.env.MONGODB_DATABASE);
        dbase.collection(process.env.MONGODB_COLLECTION_USERS)
            .update(query, new_point, function(err, res) {
                if (err) throw err;
                console.log("give 5 points completed. team member id : "+obj_member.slack_id);
                db.close();
            });
    });
}

module.exports = {
    check_slack_team: function(slack_team_id, slack_team_name) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var dbase = db.db(process.env.MONGODB_DATABASE);
            dbase.collection(process.env.MONGODB_COLLECTION_TEAMS)
             .find({slack_team_id: slack_team_id})
             .toArray(function(err, result) {
                if(result.length < 1) {
                    // Add this new team
                    var new_team_data = {
                        slack_team_id: slack_team_id,
                        slack_team_name: slack_team_name
                    };
                    dbase.collection(process.env.MONGODB_COLLECTION_TEAMS)
                    .insertOne(new_team_data, function(err, res) {
                        if (err) throw err;
                        console.log("new team inserted successfully : "+slack_team_id);
                        db.close();
                    });
                }
             });
        });
    },
    check_invited_channels: function(slack_team_id, obj_channel) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var dbase = db.db(process.env.MONGODB_DATABASE);
            var query = { slack_channel_id: obj_channel.id };

            dbase.collection(process.env.MONGODB_COLLECTION_INVITED_CHANNELS)
                .find(query)
                .toArray(function(err, result) {
                    if(result.length < 1) {
                        /** Add this new invited channel **/
                        add_new_invited_channel(dbase, slack_team_id, obj_channel);
                        db.close();
                    }
                });
        })
    },
    check_team_members: function(slack_team_id, obj_member){
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var dbase = db.db(process.env.MONGODB_DATABASE);
            var query = {
                slack_team_id: slack_team_id,
                slack_id: obj_member.id
            };
            dbase.collection(process.env.MONGODB_COLLECTION_USERS)
             .find(query)
             .toArray(function(err, result) {
                if(result.length < 1) {
                    // Add this new team
                    var new_member_data = {
                        slack_id: obj_member.id,
                        slack_name: obj_member.real_name,
                        total_point: 0,
                        received_point: 0,
                        slack_team_id: slack_team_id,
                        given_point: 0,
                        is_deleted: false
                    };
                    dbase.collection(process.env.MONGODB_COLLECTION_USERS)
                    .insertOne(new_member_data, function(err, res) {
                        if (err) throw err;
                        console.log("new team member inserted successfully : "+obj_member.id);
                        db.close();
                    });
                }
             });
        });
    },
    handle_thanks_filter_mongo: function(i_rtm, obj_channel, thanked_slack_id) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var dbase = db.db(process.env.MONGODB_DATABASE);
            var query = { slack_channel_id: obj_channel.channel };

            dbase.collection(process.env.MONGODB_COLLECTION_INVITED_CHANNELS)
                .find(query)
                .toArray(function(err, result) {
                    if(result[0].slack_channel_member_ids.length > 1) {
                        /** Check member is in group or not **/
                        if(result[0].slack_channel_member_ids.includes(thanked_slack_id)) {
                            // Check remaining given_point in karma_poipo_users
                            var thanker_user_query = {
                                slack_id : obj_channel.user
                            };
                            dbase.collection(process.env.MONGODB_COLLECTION_USERS)
                                .find(thanker_user_query)
                                .toArray(function(err, res0) {
                                    if(res0[0].given_point > 0) {
                                        MongoClient.connect(url, function(err, db) {
                                            if (err) throw err;

                                            var dbase = db.db(process.env.MONGODB_DATABASE);
                                            // Give one point to thanked user
                                            var thanked_user_query = {
                                                slack_id : thanked_slack_id
                                            };

                                            dbase.collection(process.env.MONGODB_COLLECTION_USERS)
                                            .find(thanked_user_query)
                                            .toArray(function(err, res) {
                                                console.log("thanked data");
                                                console.log(res);
                                                var updated_total_point = res[0].total_point + 1;
                                                var updated_point_today = res[0].received_point + 1;
                                                var new_thanked_user_data = {
                                                    slack_id: res[0].slack_id,
                                                    slack_name: res[0].slack_name,
                                                    total_point: updated_total_point,
                                                    received_point: updated_point_today,
                                                    slack_team_id: obj_channel.team,
                                                    given_point: res[0].given_point,
                                                    is_deleted: false
                                                };
                                                dbase.collection(process.env.MONGODB_COLLECTION_USERS)
                                                .update(
                                                    thanked_user_query,
                                                    new_thanked_user_data,
                                                    function(err, res) {
                                                        if (err) throw err;
                                                        console.log("thanked user point has been added");
                                                        console.log("slack_id : "+thanked_slack_id);
                                                    }
                                                );

                                                // Decrease one karma point from thanker
                                                var new_thanker_user_data = {
                                                    slack_id: res0[0].slack_id,
                                                    slack_name: res0[0].slack_name,
                                                    total_point: res0[0].total_point,
                                                    received_point: res0[0].received_point,
                                                    given_point : res0[0].given_point - 1,
                                                    slack_team_id: obj_channel.team,
                                                    is_deleted: false
                                                };
                                                dbase.collection(process.env.MONGODB_COLLECTION_USERS)
                                                .update(
                                                    thanker_user_query,
                                                    new_thanker_user_data,
                                                    function(err, res){
                                                        if (err) throw err;
                                                        console.log("thanker user point has been decreased");
                                                        console.log("slack_id : "+obj_channel.user);
                                                    }
                                                );
                                                db.close();
                                                // Send success response
                                                i_rtm.sendMessage(
                                                    res[0].slack_name+" receives 1 point from "+ res0[0].slack_name
                                                    +". He/She has "+updated_total_point+" points",
                                                    obj_channel.channel
                                                );
                                            });
                                        });
                                    }else {
                                        // Send response that given point is already null
                                        i_rtm.sendMessage(
                                            res0[0].slack_name+" doesn't have any point to give",
                                            obj_channel.channel
                                        );
                                    }
                                });
                        }else {
                            console.log("user is not in group yet");
                            console.log(thanked_slack_id);
                            // Send response that thanked user is not in the channel
                            var thanked_user_query = {
                                slack_id : thanked_slack_id
                            };
                            dbase.collection(process.env.MONGODB_COLLECTION_USERS)
                            .find(thanked_user_query)
                            .toArray(function(err, res) {
                                console.log(res[0]);
                                if(res.length > 0) {
                                    i_rtm.sendMessage(
                                        res[0].slack_name+" is not yet in this channel. Please invite him/her to give a karma point",
                                        obj_channel.channel
                                    );
                                }
                            });
                        }
                        db.close();
                    } else {
                        // This is for uninvited channel...
                        // This is already handled...
                    }
                });
        })
    },
    get_remain_karma_points: function(i_slack_id) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var dbase = db.db(process.env.MONGODB_DATABASE);
            var query = { slack_id: i_slack_id };

            dbase.collection(process.env.MONGODB_COLLECTION_USERS)
            .find(query)
            .toArray(function(err, result) {
                console.log(" remain karma points : ");
                console.log(result);
            });
        })
    },

    show_top_10_karma_users_point: function(i_rtm, obj_message) {
        /***
        obj_message content example :
            { type: 'message',
              channel: 'C89JHLYNP', // channel id
              user: 'U89MZ4PV2',
              text: '<@U8AEJ3DGC> leaderboard', // This is the command
              ts: '1512960670.000044',
              source_team: 'T895HCY8H',
              team: 'T895HCY8H' // team id
            }
        ***/
        MongoClient.connect(url, function(err, db){
            if (err) throw err;

            var dbase = db.db(process.env.MONGODB_DATABASE);

            // Check if karmabot_poipo is in the channel
            dbase.collection(process.env.MONGODB_COLLECTION_INVITED_CHANNELS)
                .find({slack_channel_id: obj_message.channel})
                .toArray(function(err, result){
                    if(result[0].slack_channel_id.length > 3) {
                        console.log('boot is in this channel');
                        dbase.collection(process.env.MONGODB_COLLECTION_USERS)
                        .find({slack_team_id: obj_message.team})
                        .sort({total_point: -1}) //Descending, 1 = Ascending
                        .limit(10)
                        .toArray(function(err, res){
                            if(res.length > 0) {
                                res1 = "";
                                res.forEach(function(item) {
                                    res1 = res1+item.slack_name+" : "+ item.total_point+" points \n";
                                });
                                console.log(res1);
                                i_rtm.sendMessage(
                                    res1.toString(),
                                    obj_message.channel
                                    );

                            }else {
                                i_rtm.sendMessage(
                                    'There are no top user yet in your team :)',
                                    obj_message.channel
                                );
                            }
                            db.close();
                            console.log("leaderboard finish");
                        });
                    } else {
                        console.log('boot is not in this channel');
                    }

                });
        });
    },

    get_karma_user_info: function(i_rtm, obj_message){
        /***
            obj_message content example :
            { type: 'message',
              channel: 'D8AD8CCAE',
              user: 'U89MZ4PV2', ==> slack_id
              text: 'karma',      ==> command that should be detected
              ts: '1512965076.000109',
              source_team: 'T895HCY8H',
              team: 'T895HCY8H' ==> slack team id
            }
        ***/
        MongoClient.connect(url, function(err, db){
            if (err) throw err;

            var dbase = db.db(process.env.MONGODB_DATABASE);
            dbase.collection(process.env.MONGODB_COLLECTION_USERS)
                .find({slack_id: obj_message.user})
                .toArray(function(err, result){
                    console.log(result);
                    if(result.length > 0) {
                        i_rtm.sendMessage(
                            "Your total point : "+ result[0].total_point+
                            "\n Your remain points to give : "+result[0].given_point,
                            obj_message.channel
                        );
                    }else{
                        i_rtm.sendMessage(
                            "Sorry, I couldn't find any data for you... :(",
                            obj_message.channel
                        );
                    }
                });
        });
    },

    give_5_point_everyday: function() {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var dbase = db.db(process.env.MONGODB_DATABASE);
            dbase.collection(process.env.MONGODB_COLLECTION_USERS)
            .find() // find all data in collection
            .toArray(function(err, result) {
                db.close();
                for(i = 0; i< result.length; i++) {
                    give_and_update_5_points(result[i]);
                }
            });
        });
    },

    add_new_invited_member_to_channel: function(obj_message) {
        MongoClient.connect(url, function(err, db) {
            if(err) throw err;

            var dbase = db.db(process.env.MONGODB_DATABASE);
            dbase.collection(process.env.MONGODB_COLLECTION_INVITED_CHANNELS)
            .find({slack_channel_id: obj_message.channel})
            .toArray(function(err, result){
                db.close();
                if(result.length > 0){
                    if(!result.slack_channel_member_ids.includes(obj_message.user)) {
                        // var new_member_ids = result.slack_channel_member_ids
                        //                         .concat([obj_message.user]);
                        MongoClient.connect(url, function(err, db){
                            if(err) throw err;
                            var dbase = db.db(process.env.MONGODB_DATABASE);
                            dbase.collection(process.env.MONGODB_COLLECTION_INVITED_CHANNELS)
                            .update(
                                {slack_channel_id: obj_message.channel},
                                {$addToSet:{slack_channel_member_ids:obj_message.user}},
                                function(err, res){
                                    if(err) throw err;
                                    console.log(" new channel member successfully added");
                                    db.close();
                                }
                            );
                        });
                    }
                }
            });
        });
    }

}