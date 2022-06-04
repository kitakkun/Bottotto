const {SlashCommandBuilder} = require("@discordjs/builders");
module.exports = {
  data: new SlashCommandBuilder()
      .setName('wr')
      .setDescription('wolframへのURLを生成します。')
      .addStringOption(option =>
          option.setName('expression')
              .setDescription('解釈する数式')
              .setRequired(true)
      ),
  async execute(interaction) {
    let expression = interaction.options.getString('expression');
    expression = encodeURIComponent(expression);
    let output = "Wolfram大先生の解答はこちらです⇒ https://ja.wolframalpha.com/input/?i=" + expression;
    interaction.reply(output);
  }
}
