const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('giveexp')
      .setDescription('メンバー全員に経験値を付与します。')
      .addNumberOption(option =>
          option.setName('amount')
              .setDescription('付与する経験値')
              .setRequired(true)
      ),
  async execute(interaction)
  {
    if (!interaction.member.has(Permissions.FLAGS.ADMINISTRATOR)) return;

    const amount = interaction.options.getNumber('amount');

    const file = require('../modules/file.js');
    const path = file.getPath(interaction.guildId, "levels/levels.json");
    let memberStates = file.readJSONSync(path, []);
    for (let i = 0; i < memberStates.length; i++) {
      memberStates[i].exp += amount;
    }
    file.writeJSONSync(path, memberStates);

    const message = new MessageEmbed()
        .setTitle('経験値付与完了')
        .setDescription("メンバー全員に" + amount + "経験値を付与しました。")
    interaction.reply({ embeds: [message] });
  }
}
