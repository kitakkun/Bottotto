const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
      .setName('h')
      .setDescription('コマンドのヘルプ')
      .addStringOption(option =>
          option.setName('commandName')
              .setDescription('コマンド名')
      )
      .addStringOption(option =>
          option.setName('subcommandName')
              .setDescription('サブコマンド名')
      )
  ,
  async execute(interaction) {

    const commandName = interaction.options.getString('commandName');
    const subcommandName = interaction.options.getString('subcommandName');

    const fs = require('fs');
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    if (commandName)
    {
      const command = require(`./${commandName}.js`);
      if (command) interaction.reply("Command not found");
      if (subcommandName) {
        const subcommand = command.data.options.find(i => i.name === subcommandName);
        await interaction.reply(subcommand.name + "\n" + subcommand.name.description);
      } else {
        interaction.reply(command.data.name + "\n" + command.name.description);
      }
    }

    let output = '';
    for (const file of commandFiles) {
      const command = require(`./${file}`);
      output += "`" + command.name + "` " + command.description + "\n";
    }

    interaction.reply({
      embed: {
        title: "コマンド一覧",
        description: output
      }
    });
  }
}
