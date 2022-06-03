module.exports = {
  name: 'h',
  description: '利用可能なコマンドの一覧を表示します。',
  execute(message, args) {
    const fs = require('fs');
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    var output = "コマンドプレフィックス「k!」に続けて実行できるコマンドを以下にリスト表示します。\n\n";

    for (const file of commandFiles) {
      const command = require(`./${file}`);
      const permission = command.clientPermissions;
      if (permission != null && permission.includes('ADMINISTRATOR')) {
        continue;
      }
      output += "`" + command.name + "` " + command.description + "\n";
    }

    output += "\n各コマンドの具体的な使用方法に関しては、「k!コマンド名 h」と入力してみてください。";

    message.channel.send({
      embed: {
        title: "コマンド一覧",
        description: output
      }
    });
  }
}
