module.exports = {
  name: 'teams',
  description: 'ボイスチャンネル内にいるメンバーを無作為にチーム分けします。',
  execute(message, args) {
    if (args[0] === "h") {
      message.channel.send({
          embed: {
            title: "teamsコマンドの使い方",
            description: "teamsコマンドはVCチャンネル内のメンバーを無作為にチーム分けします。具体的には、例えば現在８人がVCチャンネルにいて、４人ずつ分けたいときは、```k!teams 4 4```と入力します。また、４人がVCチャンネルにいて、１：３で分けたい場合は、```k!teams 1 3```もしくは```k!teams 3 1```と入力してください。数値及びスペースは必ず半角文字を使用してください！"
          }
        }
      );
      return;
    }
    const voiceChannel = message.member.voice.channel;
    if (voiceChannel == null) {
      message.reply("このコマンドはボイスチャットチャンネルに参加している状態で実行してください。もしわからないことがあれば、「```k!teams help```」を実行してください！");
      return;
    }
    const members = voiceChannel.members.filter(member => !member.user.bot);
    const numOfMembers = members.array().length;
    if (numOfMembers === 1) {
      message.reply("ぼっちでこのコマンド実行する意味、ある？（辛辣）");
      return;
    }
    var sum = 0;
    args = args.map(str => parseInt(str, 10));
    for (var i = 0; i < args.length; i++) {
      sum += args[i];
    }
    console.log();
    if (sum !== numOfMembers) {
      message.reply("入力が不正です。正しく数値が入力されているか、再度確認してください。もしわからないことがあれば、「```k!teams help```」を実行してください！");
      return;
    }
    var names = [];
    members.each(member => {
      if (member.nickname != null) {
        names.push(member.nickname);
      } else {
        names.push(member.user.username);
      }
    });
    // シャッフル
    for(var i = names.length - 1; i > 0; i--){
      var r = Math.floor(Math.random() * (i + 1));
      var tmp = names[i];
      names[i] = names[r];
      names[r] = tmp;
    }
    var start = 0;
    var output = "チームの振り分けが完了しました。\n\n";
    for (var i = 0; i < args.length; i++) {
      var team = names.slice(start, start+args[i]);
      output += "【チーム" + String(i+1) + "】\n";
      for (var j = 0; j < team.length; j++) {
        output += "・" + team[j] + "\n";
      }
      output += "\n";
      start += args[i];
    }
    message.channel.send({
      embed:
      {
        title: "チーム振り分け機能",
        description: output
      }
    });
  }
}
