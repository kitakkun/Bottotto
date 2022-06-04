const { SlashCommandBuilder } = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
      .setName('h')
      .setDescription('コマンドのヘルプ')
      .addStringOption(option =>
          option.setName('command')
              .setDescription('コマンド名')
      )
      .addStringOption(option =>
          option.setName('subcommand')
              .setDescription('サブコマンド名')
      )
  ,
  async execute(interaction) {

    const commandName = interaction.options.getString('command');
    const subcommandName = interaction.options.getString('subcommand');

    const fs = require('fs');
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    if (commandName)
    {
      const command = require(`./${commandName}.js`);
      if (!command) { await interaction.reply("Command not found"); return; }
      if (subcommandName) {
        const subcommand = command.data.options.find(i => i.name === subcommandName);
        await interaction.reply(subcommand.name + "\n" + subcommand.name.description);
      } else {
        await interaction.reply(command.data.name + "\n" + command.data.description);
      }
      return;
    }

    let output = '';
    for (const file of commandFiles) {
      const command = require(`./${file}`);
      output += "`" + command.data.name + "` " + command.data.description + "\n";
    }

    interaction.reply({ embeds: [new MessageEmbed()
          .setTitle("コマンド一覧").setDescription(output)]
    });
  }
}
