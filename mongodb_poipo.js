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
    get_remain_karma_points: function(i_user_id) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var dbase = db.db(process.env.MONGODB_DATABASE);
            var query = { user_id: i_user_id };

            dbase.collection(process.env.MONGODB_COLLECTION).find(query).toArray(function(err, result) {
                console.log(" remain karma points : ");
                console.log(result);
            });
        })
    },

    show_top_10:function() {

    }

}