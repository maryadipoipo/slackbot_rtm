var mongo_poipo = require('./mongodb_poipo');

module.exports = {
    thanks_filter: function(i_rtm, i_obj_message) {
        var arr = [];
        var raw_names = i_obj_message.text.split("thanks <@");

        raw_names.forEach(function (item){
            var temp = item.split(" ");
            var temp1 = item.split(">");
            //arr.push(temp1[0]);
            console.log(temp1);
            console.log("slack user id length : "+ temp1[0].length);
            if(temp1[0].length > 3) {
                // Check invited_channel first


                i_rtm.sendMessage(
                    "Thanks format detected for "+temp1[0],
                    i_obj_message.channel
                );
            }
        });
        console.log(arr);
    }
}
