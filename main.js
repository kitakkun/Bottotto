// Node.jsのモジュールを読み込む
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

const { prefix, token } = require('./config.json');
// 自作モジュールを読み込む
const file = require('./modules/file.js');
const tempChannel = require('./modules/tempChannel.js');
const textReader = require('./modules/textReader.js');
const levels = require('./modules/levels.js');
const timeSignal = require('./modules/timesignal.js');

// 各種コマンドの設定
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// 準備完了時に発火
client.on('ready', () => {
  console.log('ready...');
  timeSignal.start(client);
  client.user.setActivity("k!h to help");
});

// テキストチャンネルの更新で発火
client.on('message', message => {

  if (message.author.bot) return;   // botからのメッセージは無視

  // 読み上げ監視を記述
  textReader.read(message);
  // 経験値処理を記述
  levels.manage(message);

  // コマンドの認識と実行
  if (!message.content.startsWith(prefix)) return;  // prefixが指定されたものでない場合無視する

  // メッセージ本文からprefix部分を除き、文字列の両端の空白を削除したのち、間の空白で分割しコマンド名と引数からなる配列を得る
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();   // コマンド名の取得

  // コマンドが存在しない場合は無視
  if (!client.commands.has(command)) return;

  // コマンド実行＆エラーハンドリング
  try {
    client.commands.get(command).execute(message, args);
  } catch (error) {
    console.log(error);
    message.reply('コマンド実行時にエラーが発生しました！ ' + error.message);
  }
});

// ボイスチャンネル関連のイベントで発火
client.on('voiceStateUpdate', async(oldState, newState) => {

  tempChannel.manageTC(oldState, newState);
  tempChannel.manageVC(oldState, newState);
  textReader.checkVoiceState(oldState, newState);

  if (oldState.member.user.bot || newState.member.user.bot) return;

  levels.manage(oldState, newState);
});

// リアクションで発火
client.on('messageReactionAdd', async(reaction, user) => {
  levels.manage(reaction, user);
});

// メンバーが追加
client.on('guildMemberAdd', member => {

});

client.on('guildMemberUpdate', (oldMember, newMember) => {
  if (oldMember.premiumSince !== newMember.premiumSince) {
    console.log('someone boosted the server');
  }
});

// ログイン処理
client.login(token);
