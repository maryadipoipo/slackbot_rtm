var my_env = require('node-env-file');
var MongoClient = require('mongodb').MongoClient;

my_env(__dirname+'/.env');
var url = "mongodb://"
          +process.env.MONGODB_USER
          +":"
          +process.env.MONGODB_PASS
          +"@ds129936.mlab.com:29936/"
          +process.env.MONGODB_DATABASE;

function add_new_invited_channel (dbase, new_obj_channel) {
    var new_channel_data = {
        slack_team_id : 0, // not yet used
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

module.exports = {
    check_invited_channels: function(obj_channel) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var dbase = db.db(process.env.MONGODB_DATABASE);
            var query = { slack_channel_id: obj_channel.id };

            dbase.collection(process.env.MONGODB_COLLECTION_INVITED_CHANNELS)
                .find(query)
                .toArray(function(err, result) {
                    if(result.length < 1) {
                        /** Add this new invited channel **/
                        add_new_invited_channel(dbase, obj_channel);
                        db.close();
                    }
                });
        })
    },
    handle_thanks_filter_mongo: function(i_rtm, obj_channel, thanked_slack_id) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var dbase = db.db(process.env.MONGODB_DATABASE);
            var query = { slack_channel_id: obj_channel.channel };

            dbase.collection(process.env.MONGODB_COLLECTION_INVITED_CHANNELS)
                .find(query)
                .toArray(function(err, result) {
                    if(result.length > 1) {
                        /** Check member is in group or not **/
                        if(result.slack_channel_member_ids.includes(thanked_slack_id)) {
                            // Check remaining given_point in karma_poipo_users
                            var thanker_user_query = {
                                slack_id : obj_channel.user
                            };
                            dbase.collection(process.env.MONGODB_COLLECTION_USERS)
                                .find(thanker_user_query)
                                .toArray(function(err, res0) {
                                    if(res0.given_point > 0) {
                                        // Give one point to thanked user
                                        var thanked_user_query = {
                                            slack_id : thanked_slack_id
                                        };
                                        dbase.collection(process.env.MONGODB_COLLECTION_USERS)
                                        .find(thanked_user_query)
                                        .toArray(function(err, res) {
                                            var updated_total_point = res.total_point + 1;
                                            var updated_point_today = res.received_point + 1;
                                            var new_thanked_user_data = {
                                                total_point: updated_total_point,
                                                received_point: updated_point_today,
                                                slack_team_id: obj_channel.team
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
                                                given_point : res0.given_point - 1,
                                                slack_team_id: obj_channel.team
                                            };
                                            dbase.collection(process.env.MONGODB_COLLECTION_USERS)
                                            update(
                                                thanker_user_query,
                                                new_thanker_user_data,
                                                function(err, res){
                                                    if (err) throw err;
                                                    console.log("thanker user point has been decreased");
                                                    console.log("slack_id : "+obj_channel.user);
                                                }
                                            );

                                            // Send success response
                                            i_rtm.sendMessage(
                                                res.slack_name+" receives 1 point from "+ res0.slack_name
                                                +". He/She has "+updated_total_point+" points",
                                                obj_channel.channel
                                            );
                                        });
                                    }else {
                                        // Send response that given point is already null
                                        i_rtm.sendMessage(
                                            res0.slack_name+" doesn't have any point to give",
                                            obj_channel.channel
                                        );
                                    }
                                });
                        }else {
                            // Send response that thanked user is not in the channel
                            var thanked_user_query = {
                                slack_id : thanked_slack_id
                            };
                            dbase.collection(process.env.MONGODB_COLLECTION_USERS)
                            .find(thanked_user_query)
                            .toArray(function(err, res) {
                                i_rtm.sendMessage(
                                    res.slack_name+" is not yet in this channel",
                                    obj_channel.channel
                                );
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
                                res1 = [];
                                res.forEach(function(item) {
                                    temp = {
                                        name : item.slack_name,
                                        point : item.total_point
                                    }
                                    res1.push(temp);
                                });
                                i_rtm.sendMessage(
                                    res1,
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
                    //console.log(result[].);
                    if(result.length > 3) {
                        i_rtm.sendMessage(
                            result[0],
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

    }

}