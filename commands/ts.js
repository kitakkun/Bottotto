const {SlashCommandBuilder} = require("@discordjs/builders");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ts')
        .setDescription('時報の有効・無効を設定します。')
        .addBooleanOption(option =>
            option.setName('enable')
                .setDescription('有効化・無効化')
                .setRequired(true)
        ),
    async execute(interaction) {
        const enable = interaction.options.getBoolean('enable');
        const file = require("../modules/file.js");
        const path = file.getPath(interaction.guildId, "timesignal.json");
        let memberIDs = file.readJSONSync(path, []);
        if (enable) {
            if (!memberIDs.some(id => id === interaction.member.id)) {
                memberIDs.push(interaction.member.id);
            }
            await interaction.reply("時報が有効化されました！毎日午前0時にBottottoから通知が来ます。");
        } else {
            memberIDs = memberIDs.filter(id => id !== interaction.member.id);
            await interaction.reply("時報が無効化されました！");
        }
        file.writeJSONSync(path, memberIDs);
    }
}
