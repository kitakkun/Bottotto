const {SlashCommandBuilder} = require("@discordjs/builders");
const {Permissions} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
      .setName('ignore')
      .setDescription('読み上げ時に無視する接頭文字列を設定')
      .addSubcommand(subcommand =>
          subcommand.setName('add')
              .setDescription('無視する接頭語を追加')
              .addStringOption(option =>
                  option.setName('target')
                      .setDescription('無視する接頭語')
                      .setRequired(true)
              )
      )
      .addSubcommand(subcommand =>
          subcommand.setName('remove')
              .setDescription('無視する接頭語を削除')
              .addStringOption(option =>
                  option.setName('target')
                      .setDescription('削除する接頭語')
                      .setRequired(true)
              )
      ),
  async execute(interaction) {

    if (!interaction.member.has(Permissions.FLAGS.ADMINISTRATOR)) { return; }

    const guild = interaction.guild;
    const file = require('../modules/file.js');
    const path = "servers/" + guild.id + "/read/ignore.json";
    let ignoreList = file.readJSONSync(path, []);

    const subcommand = interaction.options.getSubcommand();
    const target = interaction.options.getString('target');

    if (subcommand === "add") {
      ignoreList.push(target);
      ignoreList = Array.from(new Set(ignoreList));
    } else if (subcommand === "remove") {
      ignoreList = ignoreList.filter(item => item !== target);
    }

    let commands = ignoreList.join(',');

    interaction.reply({ embed: { title: "読み上げ無視設定", description: "読み上げコマンド実行時次の単語から始まるメッセージはすべて無視されます。\n" + commands } });
    file.writeJSONSync(path, ignoreList);
  }
}
