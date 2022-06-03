module.exports = {
  name: 'ignore',
  description: '読み上げ時に無視する接頭文字列を設定します。',
  clientPermissions: ['ADMINISTRATOR'],
  execute(message, args) {

    if (!message.member.hasPermission('ADMINISTRATOR')) {
      console.log("[ignore command] blocked operation.");
      return;
    }

    const guild = message.guild;
    const file = require('../modules/file.js');
    const path = "servers/" + guild.id + "/read/ignore.json";
    var ignoreList = file.readJSONSync(path, []);
    if (args[0] == "add") {
      args.shift();
      for (var i = 0; i < args.length; i++) {
        ignoreList.push(args[i]);
      }
      ignoreList = Array.from(new Set(ignoreList));
    } else if (args[0] == "remove") {
      args.shift();
      for (var i = 0; i < args.length; i++) {
        ignoreList = ignoreList.filter(item => item != args[i]);
      }
    }
    var commands = '';
    for (var i = 0; i < ignoreList.length; i++) {
      if (i == ignoreList.length - 1) {
        commands += "`" + ignoreList[i] + "`";
      } else {
        commands += "`" + ignoreList[i] + "`, ";
      }
    }
    message.channel.send({
      embed: {
        title: "読み上げ無視設定",
        description: "読み上げコマンド実行時次の単語から始まるメッセージはすべて無視されます。\n" + commands
      }
    });
    file.writeJSONSync(path, ignoreList);
  }
}
