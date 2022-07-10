// Node.jsのモジュールを読み込む
const fs = require('node:fs');

const { Client, Intents, Collection} = require('discord.js');
const { token } = require('./config.json');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_VOICE_STATES]});

// 自作モジュールを読み込む
const timeSignal = require('./modules/timesignal.js');
const path = require("path");

const { syncDatabase } = require("./modules/database");
const { TempChannelManager } = require("./modules/manager/TempChannelManager");
const {ReadChannelManager} = require("./modules/manager/ReadChannelManager");

const tempChannelManager = new TempChannelManager();
const readChannelManager = new ReadChannelManager();

// 各種コマンドの設定
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// 準備完了時に発火
client.once('ready', async() => {
  console.log('ready...');
  timeSignal.start(client);
  await syncDatabase();
  client.user.setActivity("/h to help");
});

client.on("messageCreate", async (message) => {
  // 読み上げ監視
    await readChannelManager.speech(message);
  // await textReader.read(message);
  // 経験値処理
  // levels.manage(message);
});

client.on('interactionCreate', async (interaction) => {
  // if the interaction is not a command, ignore it.
  if (!interaction.isCommand()) return;
  if (interaction.user.bot) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Oops, something went wrong with the command!' });
  }
});

// ボイスチャンネル関連のイベントで発火
client.on('voiceStateUpdate', async(oldState, newState) => {

    await tempChannelManager.processVoiceEvent(oldState, newState);
    await readChannelManager.checkVoiceState(oldState, newState);

    if (oldState?.member?.user.bot || newState?.member?.user.bot) return;

});

// リアクションで発火
client.on('messageReactionAdd', async(reaction, user) => {
  // levels.manage(reaction, user);
});

// メンバーが追加
client.on('guildMemberAdd', (member) => {

});

client.on('guildMemberUpdate', (oldMember, newMember) => {
  if (oldMember.premiumSince !== newMember.premiumSince) {
    console.log('someone boosted the server');
  }
});

// ログイン処理
client.login(token);
