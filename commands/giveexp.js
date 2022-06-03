module.exports = {
  name: 'giveexp',
  description: 'メンバー全員に経験値を付与します。',
  execute(message, args) {
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      console.log("[giveexp command] blocked operation.");
      return;
    }
    args[0] = parseInt(args[0], 10);
    if (isNaN(args[0])) return;
    const file = require('../modules/file.js');
    const path = file.getPath(message.guild, "levels/levels.json");
    let memberStates = file.readJSONSync(path, []);
    for (var i = 0; i < memberStates.length; i++) {
      memberStates[i].exp += args[0];
    }
    file.writeJSONSync(path, memberStates);
    message.channel.send(
      {
        embed:
        {
          title: "経験値付与完了",
          description: "メンバー全員に" + args[0] + "経験値を付与しました。"
        }
      }
    );
  }
}
