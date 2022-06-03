module.exports = {
  name: 'ts',
  description: '時報の有効・無効を設定します。',
  execute(message, args) {
    const file = require("../modules/file.js");
    const path = file.getPath(message.guild, "timesignal.json");
    let memberIDs = file.readJSONSync(path, []);
    if (args[0] == 'on' || args[0] == 'ON' || args[0] == 'On') {
      if (!memberIDs.some(id => id == message.member.id)) {
        memberIDs.push(message.member.id);
      }
      message.channel.send("時報が有効化されました！毎日午前0時にBottottoから通知が来ます。");
    } else if (args[0] == 'off' || args[0] == 'OFF' || args[0] == 'Off') {
      memberIDs = memberIDs.filter(id => id != message.member.id);
      message.channel.send("時報が無効化されました！");
    }
    file.writeJSONSync(path, memberIDs);
  }
}
