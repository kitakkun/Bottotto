const {SlashCommandBuilder} = require("@discordjs/builders");
const { joinVoiceChannel, getVoiceConnection} = require('@discordjs/voice');
const {MessageEmbed} = require("discord.js");
module.exports = {
  help: new MessageEmbed()
      .setTitle("readコマンドヘルプ")
      .setDescription("`/read s`で読み上げ開始、`/read e`で読み上げを終了します。"),
  data: new SlashCommandBuilder()
      .setName('read')
      .setDescription('コマンドが実行されたテキストチャンネル内の書き込みを読み上げます。')
      .addSubcommand(subcommand =>
          subcommand.setName('s')
              .setDescription('読み上げを開始します')
      )
      .addSubcommand(subcommand =>
          subcommand.setName('e')
              .setDescription('読み上げを終了します')
      )
  ,
  async execute(interaction) {

    const subcommand = interaction.options.getSubcommand();

    // TODO: ディクショナリー（文字列置換ルール登録）

    const voiceChannel = interaction.member.voice.channel;
    if (voiceChannel == null) {
      await interaction.reply("このコマンドを実行する際は、まず初めにボイスチャンネルに接続してください！");
      return;
    }

    const file = require('../modules/file.js');
    const guild = interaction.guild;
    const path = file.getPath(guild, "read/read.json");

    let data = file.readJSONSync(path, {});

    if (subcommand === "s") {
      // もし既に監視チャンネルが存在していた場合
      if (Object.keys(data).length) {
        interaction.reply("現在、既に他のボイスチャンネルで読み上げを行っているため読み上げを開始できません。");
        return;
      }

      joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
      });
      interaction.reply({ embeds: [
          new MessageEmbed().setTitle("テキスト読み上げを開始します！")
              .setDescription("以後 #" + interaction.channel.name + " に書き込まれた内容を自動読み上げするよ！")
          ]
      });
      data.voiceChannel = voiceChannel.id;
      data.textChannel = interaction.channel.id;
      file.writeJSONSync(path, data);
      return;
    }

    if (subcommand === "e") {
      await interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("テキスト読み上げを終了します！")
                .setDescription("じゃあの。また使ってくださいな。")
        ]
      });
      if (Object.keys(data).length) {
        const connection = getVoiceConnection(guild.id);
        if (connection) connection.disconnect();
      }
      data = {};
      file.writeJSONSync(path, data);
    }
  }
}
