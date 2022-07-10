const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageEmbed} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('自分の経験値、レベル及びランクを表示します。')
        .addSubcommand(subcommand =>
            subcommand.setName('notify')
                .setDescription('レベルアップ通知')
                .addBooleanOption(option =>
                    option.setName('enable')
                        .setDescription('レベルアップ時の通知を有効化')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('list')
                .setDescription('ランク表を表示')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('me')
                .setDescription('ユーザー自身のランクを表示')
        )
    ,
    async execute(interaction) {

        let message;
        const subcommand = interaction.options.getSubcommand();

        const file = require("../modules/file.js");
        const levels = require("../modules/levels.json");

        const member = interaction.member;

        const path = file.getPath(interaction.guild, "levels/levels.json");
        let memberStates = file.readJSONSync(path, []);
        let memberState = memberStates.find(ms => ms.id === member.id);

        if (memberState == null) return;

        // 通知設定オプション
        if (subcommand === 'notify') {
            const enable = interaction.options.getBoolean('enable');
            if (enable) {
                message = new MessageEmbed()
                    .setTitle('レベルアップ通知ON')
                    .setDescription('設定が完了しました！以後DMにてレベルアップの通知が届くようになります。');
                memberState.notify = true;
            } else {
                memberState.notify = false;
                message = new MessageEmbed()
                    .setTitle('レベルアップ通知OFF')
                    .setDescription('設定が完了しました！以後DMにてレベルアップの通知が届かなくなります．');
            }
            // データの更新
            file.writeJSONSync(path, memberStates);
            // 設定完了通知
            await interaction.reply({embeds: [message]});
            return;
        }

        // リスト表示
        if (subcommand === "list") {
            let output = "";
            for (let i = 0; i < memberStates.length && i < 10; i++) {
                try {
                    const memberState = memberStates[i];
                    await interaction.guild.members.fetch(memberState.id).catch(console.log);
                    const member = interaction.guild.members.resolve(memberState.id);
                    if (member != null) {
                        if ([1, 2, 3].includes(memberState.rank)) {
                            output += "**#" + memberState.rank + "**: ";
                            output += "**" + member.displayName + "**";
                        } else {
                            output += "#" + memberState.rank + ": ";
                            output += member.displayName;
                        }
                        output += " （レベル: " + memberState.level + ", 累計経験値: " + memberState.exp + "）\n";
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            // 最後の改行コードを削除
            output.slice(0, -1);
            const replyMsg = new MessageEmbed()
                .setTitle("ランク表 Top 10")
                .setDescription(output);
            await interaction.reply({embeds: [replyMsg]})
            return;
        }

        // 自分のランクを表示
        if (subcommand === 'me') {
            const requiredExp = levels[memberState.level - 1] - memberState.exp;
            message = new MessageEmbed()
                .setTitle(member.displayName + "さんのランク")
                .setThumbnail(member.user.displayAvatarURL({format: 'png'}))
                .addFields(
                    {
                        name: "ランク",
                        value: `${memberState.rank} 位`,
                        inline: true
                    },
                    {
                        name: "レベル",
                        value: `${memberState.level} `,
                        inline: true
                    },
                    {
                        name: "累計経験値",
                        value: `${memberState.exp} EXP`,
                        inline: true
                    },
                    {
                        name: "レベルアップまで",
                        value: `あと ${requiredExp} EXP`
                    }
                );

            if (memberState.rank === 1) {
                message.setColor(0xe6b422);
            } else if (memberState.rank === 2) {
                message.setColor(0xc0c0c0);
            } else if (memberState.rank === 3) {
                message.setColor(0xb87333);
            }

            await interaction.reply({embeds: [message]});
        }
    }
}
