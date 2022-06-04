const {getVoiceConnection, joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");
const fsEx = require("fs-extra");
let playing = false;
let event_queue = [];
exports.read = async function read(message) {
  let i;
  if (playing) {
    event_queue.push(message);
    return;
  }

  const file = require("./file.js");
  const fsEx = require('fs-extra');
  const { execSync }= require('child_process');

  const guild = message.guild;
  const path = file.getPath(guild.id, "read/read.json");
  const data = file.readJSONSync(path, {});

  // 置換処理の定義
  String.prototype.replaceAll = function(beforeStr, afterStr) {
    let reg = new RegExp(beforeStr, "g");
    return this.replace(reg, afterStr);
  };

  // 名前解決用
  // メンバーのID
  let memberIDs;
  // 役職ID
  let roleIDs;
  // チャンネルID
  let channelIDs;

  // 読み上げチャンネルがない場合
  if (Object.keys(data).length === 0) return;
  // 読み上げ対象でない場合
  if (message.channel.id !== data.textChannel) return;

  console.log(message.content);

  // 読み上げ処理
  let text = message.content.replaceAll('\n', ' ').replaceAll(/(?:https?|ftp):\/\/[\n\S]+/g, '');

  // TODO: ユーザー名・役職名・チャンネル名解決
  memberIDs = text.match(/<@\d{18}>/);
  if (memberIDs != null) {
    memberIDs = Array.from(memberIDs);
    const members = guild.members;
    for (i = 0; i < memberIDs.length; i++) {
      const memberID = memberIDs[i].replace(/\D/g, '');
      const member = members.cache.find(member => member.id === memberID);
      if (member != null) text = text.replaceAll(memberIDs[i], "@" + member.displayName);
    }
  }

  roleIDs = text.match(/<@&\d{18}>/);
  if (roleIDs != null) {
    roleIDs = Array.from(roleIDs);
    const roles = guild.roles;
    for (i = 0; i < roleIDs.length; i++) {
      const roleID = roleIDs[i].replace(/\D/g, '');
      const role = roles.cache.find(role => role.id === roleID);
      if (role != null) text = text.replaceAll(roleIDs[i], "@" + role.name);
    }
  }

  channelIDs = text.match(/<#\d{18}>/);
  if (channelIDs != null) {
    channelIDs = Array.from(channelIDs);
    const channels = guild.channels;
    for (i = 0; i < channelIDs.length; i++) {
      const channelID = channelIDs[i].replace(/\D/g, '');
      const channel = channels.cache.find(channel => channel.id === channelID);
      if (channel != null) text = text.replaceAll(channelIDs[i], "テキストチャンネル" + channel.name);
    }
  }

  // 絵文字無視
  text = text.replaceAll('<:[a-zA-Z0-9_]+:[0-9]+>', '');

  // もし登録されているコマンドプレフィックスで開始した場合無視
  const ignore_path = "servers/" + guild.id + "/read/ignore.json";
  const ignoreList = file.readJSONSync(ignore_path, []);
  for (i = 0; i < ignoreList.length; i++) {
    if (text.startsWith(ignoreList[i])) {
      console.log("reading text was skipped");
      return;
    }
  }

  // 100字以上は読まない
  if (text.length >= 100) {
    message.reply("ごめんなさい。100字以上の文章を読み上げようとすると頭がパンクしちゃいます！");
    return;
  }

  // テキストファイル作成
  fsEx.outputFileSync("audio/read/" + guild.id + "/input.txt", text);
  // OpenJTalkを呼び出し音声を作成
  const command = "open_jtalk -m /usr/local/share/MMDAgent_Example-1.8/Voice/mei/mei_normal.htsvoice -ow ./audio/read/" + guild.id + "/output.wav -x /usr/local/share/open_jtalk_dic_utf_8-1.07 ./audio/read/" + guild.id + "/input.txt";
  try {
    execSync(command, (err, stdout, stderr) => {
      if (err) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  } catch (e) {
    console.log("error");
    return;
  }
  let connection = getVoiceConnection(guild.id);

  if (!connection) {
    connection = joinVoiceChannel({
      channelId: data.voiceChannel,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator
    });
    console.log("reconnect");
  }

  const player = createAudioPlayer();
  const resource = createAudioResource('./audio/read/' + guild.id + '/output.wav');

  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, async() => {
    playing = false;
    fsEx.removeSync('./audio/read/' + guild.id + '/output.wav');
    if (event_queue.length) {
      message = event_queue.shift();
      await read(message);
    }
  });

  playing = true;
  player.play(resource);
}

exports.checkVoiceState = async(oldState, newState) => {
  const file = require('./file.js');
  const guild = oldState.guild;
  const path = file.getPath(guild.id, "read/read.json");

  let data = file.readJSONSync(path, {});
  if (Object.keys(data).length) {
    const connection = getVoiceConnection(guild.id);
    const channel = await guild.channels.resolve(data.voiceChannel);
    // 自分だけになったら抜ける
    if (channel.members.size === 1) {
      data = {};
      file.writeJSONSync(path, data);
      if (connection) connection.disconnect();
    }
  }
}
