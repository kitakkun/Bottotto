module.exports = {
  name: 'read',
  description: 'コマンドが実行されたテキストチャンネル内の書き込みを読み上げます。',
  execute(message, args) {

    if (args[0] === "h") {
      message.channel.send({
        embed:
        {
          title: "readコマンドヘルプ",
          description: "`k!read s`で読み上げ開始、`k!read e`で読み上げを終了します。"
        }
      });
      return;
    }

    // TODO: ディクショナリー（文字列置換ルール登録）
    if (args[0] === "dic") {

    }

    const voiceChannel = message.member.voice.channel;
    if (voiceChannel == null) {
      message.reply("このコマンドを実行する際は、まず初めにボイスチャンネルに接続してください！");
      return;
    }

    const file = require('../modules/file.js');
    const guild = message.guild;
    const path = file.getPath(guild, "read/read.json");

    var data = file.readJSONSync(path, {});

    if (args[0] === "s") {
      // もし既に監視チャンネルが存在していた場合
      if (Object.keys(data).length) {
        message.reply("現在、既に他のボイスチャンネルで読み上げを行っているため読み上げを開始できません。");
        return;
      }
      guild.channels.resolve(voiceChannel.id).join();
      message.channel.send({
        embed: {
          title: "テキスト読み上げを開始します！",
          description: "以後 #" + message.channel.name + " に書き込まれた内容を自動読み上げするよ！"
        }
      });
      data.voiceChannel = voiceChannel.id;
      data.textChannel = message.channel.id;
      file.writeJSONSync(path, data);
    } else if (args[0] === "e") {
      message.channel.send({
        embed: {
          title: "テキスト読み上げを終了します！",
          description: "じゃあの。また使ってくださいな。"
        }
      });
      if (Object.keys(data).length) {
        guild.channels.resolve(data.voiceChannel).leave();
      }
      data = {};
      file.writeJSONSync(path, data);
    }
  }
}
