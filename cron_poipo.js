var CronJob = require('cron').CronJob;
var mongo_poipo = require('./mongodb_poipo');

module.exports = {
    give_5_points_cron:  new CronJob('00 00 00 * * 1-5', function() {
      /*
       * Runs every weekday (Monday through Friday)
       * at 00:00:00 AM. It does not run on Saturday
       * or Sunday.
       */
       //console.log("run on weekday ajjah pukul 00.00");
        mongo_poipo.give_5_point_everyday();
      }, function () {
        /* This function is executed when the job stops */
        console.log("successfully executed the cron give_5_points_cron")
      },
      true, /* Start the job right now */
      'Asia/Jakarta' /* Time zone of this job. */
    ),

    test_everysecond: new CronJob('* * * * * *', function() {
      // Executed every second
        mongo_poipo.give_5_point_everyday();
      }, function () {
        /* This function is executed when the job stops */
        console.log("successfully executed the cron give_5_points_cron")
      },
      true, /* Start the job right now */
      'Asia/Jakarta' /* Time zone of this job. */
    ),

}