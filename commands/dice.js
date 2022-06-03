const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('dice')
      .setDescription('ダイスを振ります。TRPGで使えます。')
      .addSubcommand(subcommand =>
        subcommand.setName('h')
            .setDescription('使い方を表示')
      )
      .addSubcommand(subcommand =>
          subcommand.setName('roll')
              .setDescription('ダイスを振ります')
              .addNumberOption(option =>
                  option.setName('diceCounts')
                      .setDescription('振るダイスの数')
                      .setRequired(true)
              )
              .addNumberOption(option =>
                  option.setName('diceMax')
                      .setDescription('ダイスの最大の目')
                      .setRequired(true)
              )
      )
  ,
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'h')
    {
      const message = new MessageEmbed()
          .setTitle('diceコマンドの使い方')
          .setDescription('ダイスを振ります第1引数にはダイスの数を、第2引数にはダイスの最大の目を入力してください。')
      interaction.reply({ embeds: { message } });
      return;
    }

    if (subcommand === 'roll')
    {

      let num = interaction.options.getNumber('diceCounts');
      let max = interaction.options.getNumber('diceMax');

      let result = "";

      for (let i = 0; i < num; i++) {
        if (i !== 0) result += ", ";
        result += getRandInt(1, max);
      }

      const message = new MessageEmbed()
          .setTitle('dice: " + num + "d" + max')
          .setDescription("ダイスの目は" + result + "でした。");

      interaction.reply({ embeds: message });

      function getRandInt(min, max) {
        return Math.floor(Math.random() * max) + min;
      }
    }
  }
}
