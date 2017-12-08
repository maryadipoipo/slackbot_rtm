var MongoClient = require('mongodb').MongoClient;

var url = "mongodb://"
          +process.env.MONGODB_USER
          +":"
          +process.env.MONGODB_PASS
          +"@ds129936.mlab.com:29936/"
          +process.env.MONGODB_DATABASE;


module.exports = {
    get_remain_karma_points: function(m_user_id) {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;

            var dbase = db.db(process.env.MONGODB_DATABASE);
            var query = { user_id: m_user_id };

            dbase.collection("karma_points").find(query).toArray(function(err, result) {
                console.log(" remain karma points : ");
                console.log(result);
            });
        }
    },

}