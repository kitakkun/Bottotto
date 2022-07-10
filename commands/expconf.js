const {SlashCommandBuilder} = require('@discordjs/builders');
const {Permissions} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('expconf')
        .setDescription('経験値の倍率を設定します。')
        .addNumberOption(option =>
            option.setName('magnitude')
                .setDescription('倍率')
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return;

        let mag = interaction.options.getNumber('magnitude');

        const file = require('../modules/file.js');
        const path = file.getPath(interaction.guild, "levels/expconf.json");

        file.writeJSONSync(path, mag);
        interaction.reply("経験値倍率を" + String(mag) + "倍に変更しました。");
    }
}
