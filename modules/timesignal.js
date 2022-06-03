exports.start = (client) => {
  const file = require('./file.js');
  const schedule = require('node-schedule');
  const job = schedule.scheduleJob('0 0 * * *', function () {
    console.log("0時です");
    const guilds = client.guilds.cache;
    guilds.each(guild => {
      const memberIDs = file.readJSONSync(file.getPath(guild, 'timesignal.json'), []);
      memberIDs.forEach(async (id) => {
        await guild.members.fetch(id);
        let member = await guild.members.resolve(id);
        if (member != null) {
          member.send({
            embed:
                {
                  title: "時報：日付変更のお知らせ",
                  description: "ただいまの時刻は午前0時です。そろそろお布団に入りませんか？"
                }
          });
        }
      });
    });
  });
}
