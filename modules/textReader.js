playing = false;
eventque = [];
exports.read = async function read(message) {

  if (playing) {
    eventque.push(message);
    return;
  }

  const file = require("./file.js");
  const fsEx = require('fs-extra');
  const { execSync }= require('child_process');

  const guild = message.guild;
  const path = file.getPath(guild, "read/read.json");

  const data = file.readJSONSync(path, {});

  String.prototype.replaceAll = function(beforeStr, afterStr) {
    var reg = new RegExp(beforeStr, "g");
    return this.replace(reg, afterStr);
  };

  if (Object.keys(data).length) {
    if (message.channel.id === data.textChannel) {
      // 読み上げ処理
      var text = message.content.replaceAll('\n', ' ').replaceAll(/(?:https?|ftp):\/\/[\n\S]+/g, '');

      // TODO: ユーザー名・役職名・チャンネル名解決
      memberIDs = text.match(/<@[0-9]{18}>/);
      if (memberIDs != null) {
        memberIDs = Array.from(memberIDs);
        const members = guild.members;
        for (var i = 0; i < memberIDs.length; i++) {
          const memberID = memberIDs[i].replace(/[^0-9]/g, '');
          const member = members.cache.find(member => member.id === memberID);
          if (member != null) text = text.replaceAll(memberIDs[i], "@" + member.displayName);
        }
      }

      roleIDs = text.match(/<@&[0-9]{18}>/);
      if (roleIDs != null) {
        roleIDs = Array.from(roleIDs);
        const roles = guild.roles;
        for (var i = 0; i < roleIDs.length; i++) {
          const roleID = roleIDs[i].replace(/[^0-9]/g, '');
          const role = roles.cache.find(role => role.id === roleID);
          if (role != null) text = text.replaceAll(roleIDs[i], "@" + role.name);
        }
      }

      channelIDs = text.match(/<#[0-9]{18}>/);
      if (channelIDs != null) {
        channelIDs = Array.from(channelIDs);
        const channels = guild.channels;
        for (var i = 0; i < channelIDs.length; i++) {
          const channelID = channelIDs[i].replace(/[^0-9]/g, '');
          const channel = channels.cache.find(channel => channel.id === channelID);
          if (channel != null) text = text.replaceAll(channelIDs[i], "テキストチャンネル" + channel.name);
        }
      }

      // 絵文字無視
      text = text.replaceAll('<:[a-zA-Z0-9_]+:[0-9]+>', '');

      // もし登録されているコマンドプレフィックスで開始した場合無視
      const ignore_path = "servers/" + guild.id + "/read/ignore.json";
      const ignoreList = file.readJSONSync(ignore_path, []);
      var ignore = false;
      for (var i = 0; i < ignoreList.length; i++) {
        if (text.startsWith(ignoreList[i])) {
          console.log("reading text was skipped");
          return;
        }
      }

      if (text.length >= 100) {
        message.reply("ごめんなさい。100字以上の文章を読み上げようとすると頭がパンクしちゃいます！");
        return;
      }

      fsEx.outputFileSync("audio/read/" + guild.id + "/input.txt", text);
      const command = "open_jtalk -m /usr/local/share/MMDAgent_Example-1.8/Voice/mei/mei_normal.htsvoice -ow ./audio/read/" + guild.id + "/output.wav -x /usr/local/share/open_jtalk_dic_utf_8-1.07 ./audio/read/" + guild.id + "/input.txt";
      try {
        execSync(command, (err, stdout, stderr) => {
          if (err) {
            console.log(`stderr: ${stderr}`);
            return;
          }
          console.log(`stdout: ${stdout}`);
          });
      } catch(e) {
        console.log("error");
        return;
      }
      const connection = await guild.channels.resolve(data.voiceChannel).join();
      const dispatcher = connection.play('./audio/read/' + guild.id + '/output.wav');

      dispatcher.on('start', () => {
        playing = true;
      });

      dispatcher.on('finish', () => {
        fsEx.removeSync('./audio/read/' + guild.id + '/output.wav');
        playing = false;
        if (eventque.length) {
          message = eventque.shift();
          read(message);
        }
      });
      // 反応しなくなってしまうバグ修正
      dispatcher.on('close', () => {
        playing = false;
      });
    }
  }
}
exports.checkVoiceState = (oldState, newState) => {
  const file = require('./file.js');
  const guild = oldState.guild;
  const path = file.getPath(guild, "read/read.json");

  var data = file.readJSONSync(path, {});
  if (Object.keys(data).length) {
    const channel = guild.channels.resolve(data.voiceChannel);
    // 自分だけになったら抜ける
    if (channel.members.array().length === 1) {
      data = {};
      file.writeJSONSync(path, data);
      channel.leave();
    }
  }
}
