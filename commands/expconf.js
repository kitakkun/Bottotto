module.exports = {
  name: 'expconf',
  description: '経験値の倍率を設定します。',
  execute(message, args) {

    if (!message.member.hasPermission('ADMINISTRATOR')) {
      return;
    }

    let mag = Number(args[0]);

    if (mag == NaN) return;

    const file = require('../modules/file.js');
    const path = file.getPath(message.guild, "levels/expconf.json");

    file.writeJSONSync(path, mag);
    message.channel.send("経験値倍率を" + String(mag) + "倍に変更しました。");
  }
}
