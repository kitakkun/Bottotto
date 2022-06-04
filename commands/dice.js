const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  help: new MessageEmbed()
      .setTitle('diceコマンドの使い方')
      .setDescription('ダイスを振ります第1引数にはダイスの数を、第2引数にはダイスの最大の目を入力してください。'),
  data: new SlashCommandBuilder()
      .setName('dice')
      .setDescription('ダイスを振ります。TRPGで使えます。')
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
  ,
  async execute(interaction) {

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

      interaction.reply({ embeds: [message] });

      function getRandInt(min, max) {
        return Math.floor(Math.random() * max) + min;
      }
  }
}
