module.exports = {
  name: 'rank',
  description: '自分の経験値、レベル及びランクを表示します。',
  execute(message, args) {

    const file = require("../modules/file.js");
    const levels = require("../modules/levels.json");

    const member = message.member;

    const path = file.getPath(message.guild, "levels/levels.json");
    let memberStates = file.readJSONSync(path, []);
    let memberState = memberStates.find(ms => ms.id == message.member.id);

    if (memberState == null) return;

    // 通知設定オプション
    if (args[0] == "notify") {
      var output = '';
      if (args[1] == "on") {
        memberState.notify = true;
        output = {
          embed:
          {
            title: "レベルアップ通知ON",
            description: "設定が完了しました！以後DMにてレベルアップの通知が届くようになります。"
          }
        };
      } else if (args[1] == "off") {
        memberState.notify = false;
        output = {
          embed:
          {
            title: "レベルアップ通知OFF",
            description: "設定が完了しました！以後DMでのレベルアップの通知が届かなくなります。"
          }
        };
      } else {
        return;
      }
      // データの更新
      file.writeJSONSync(path, memberStates);
      // 設定完了通知
      message.channel.send(output);
      return;
    } else if (args[0] == "list") {
      // displayNameが取得できないので間にfetchを挟みとりあえず解決
      (async() => {
        var output = "";
        for (var i = 0; i < memberStates.length; i++) {
          // 10人まで表示
          if (i == 10 && args[1] != "all") break;
          try {
            const memberState = memberStates[i];
            await message.guild.members.fetch(memberState.id).catch(console.log);
            const member = message.guild.members.resolve(memberState.id);
            if (member != null) {
              if ([1, 2, 3].includes(memberState.rank)) {
                output += "**#" + memberState.rank + "**: ";
                output += "**" + member.displayName + "**";
              } else {
                output += "#" + memberState.rank + ": ";
                output += member.displayName;
              }
              output += " （レベル: " + memberState.level + ", 累計経験値: " + memberState.exp + "）\n";
            }
          } catch (e) {
            console.log(e);
          }
        }
        // 最後の改行コードを削除(?)
        output.slice(0, -1);
        if (args[1] != "all") {
          message.channel.send({
            embed: {
              title: "ランク表 Top 10",
              description: output
            }
          });
        } else if (args[1] == "all") {
          // const fsEx = require("fs-extra");
          // fsEx.outputFileSync("tmp/rank.txt", "全ランク表\n" + output);
          message.channel.send("全ランク表\n" + output);
        }

      })();
      return;
    }

    const requiredExp = levels[memberState.level - 1] - memberState.exp;

    var embed = {
      thumbnail: {
        url: member.user.displayAvatarURL({ format: 'png' })
      },
      title: member.displayName + "さんのランク",
      fields: [
        {
          name: "ランク",
          value: memberState.rank + " 位",
          inline: true
        },
        {
          name: "レベル",
          value: memberState.level,
          inline: true
        },
        {
          name: "累計経験値",
          value: memberState.exp + " EXP",
          inline: true
        },
        {
          name: "レベルアップまで",
          value: "あと" + requiredExp + " EXP"
        }
      ]
    }

    if (memberState.rank == 1) {
      embed.color = 0xe6b422;
    } else if (memberState.rank == 2) {
      embed.color = 0xc0c0c0;
    } else if (memberState.rank == 3) {
      embed.color = 0xb87333;
    }

    message.channel.send({
      embed: embed
    });
  }
}
