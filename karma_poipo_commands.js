var mongo_poipo = require('./mongodb_poipo');

module.exports = {
    thanks_filter: function(i_rtm, obj_message) {
        var arr = [];
        var raw_names = obj_message.text.split("thanks <@");

        raw_names.forEach(function (item){
            var temp = item.split(" ");
            var temp1 = item.split(">");
            //arr.push(temp1[0]);
            // console.log(temp1);
            // console.log("slack user id length : "+ temp1[0].length);
            if(temp1[0].length > 3) {
                // Check invited_channel first
                console.log("thanked slack id : "+temp1[0]);
                mongo_poipo.handle_thanks_filter_mongo(i_rtm, obj_message, temp1[0]);
                // i_rtm.sendMessage(
                //     "Thanks format detected for "+temp1[0],
                //     obj_message.channel
                // );
            }
        });
        console.log(arr);
    }
}
