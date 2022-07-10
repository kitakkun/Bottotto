const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");

module.exports = {
    help: new MessageEmbed()
        .setTitle('teamsコマンドの使い方')
        .setDescription("teamsコマンドはVCチャンネル内のメンバーを無作為にチーム分けします。" +
            "具体的には、例えば現在８人がVCチャンネルにいて、４人ずつ分けたいときは、```/teams 4 4```と入力します。" +
            "また、４人がVCチャンネルにいて、１：３で分けたい場合は、```/teams 1 3```もしくは```/teams 3 1```と入力してください。" +
            "数値及びスペースは必ず半角文字を使用してください！"),
    data: new SlashCommandBuilder()
        .setName('teams')
        .setDescription('ボイスチャンネル内にいるメンバーを無作為にチーム分けします。')
        .addStringOption(option =>
            option.setName('team_member_counts')
                .setDescription('各チームのメンバー数')
                .setRequired(true)
        ),
    async execute(interaction) {

        const voiceChannel = interaction.member.voice.channel;
        if (voiceChannel == null) {
            interaction.reply("このコマンドはボイスチャットチャンネルに参加している状態で実行してください。");
            return;
        }

        const members = voiceChannel.members.filter(member => !member.user.bot);
        const numOfMembers = members.size;

        const team_member_counts = interaction.options.getNumber('team_member_counts');
        let args = team_member_counts.split(' ');
        let sum = 0;
        for (let i = 0; i < args.length; i++) {
            sum += Number(args[i]);
        }

        if (sum !== numOfMembers) {
            await interaction.reply("入力が不正です。正しく数値が入力されているか、再度確認してください。");
            return;
        }

        // 名前のリスト作成
        let names = [];
        members.each(member => {
            if (member.nickname != null) {
                names.push(member.nickname);
            } else {
                names.push(member.user.username);
            }
        });

        // シャッフル
        for (let i = names.length - 1; i > 0; i--) {
            let r = Math.floor(Math.random() * (i + 1));
            let tmp = names[i];
            names[i] = names[r];
            names[r] = tmp;
        }

        let start = 0;
        let output = "チームの振り分けが完了しました。\n\n";
        for (let i = 0; i < args.length; i++) {
            let team = names.slice(start, start + Number(args[i]));
            output += "【チーム" + String(i + 1) + "】\n";
            for (let j = 0; j < team.length; j++) {
                output += "・" + team[j] + "\n";
            }
            output += "\n";
            start += args[i];
        }

        const msg = new MessageEmbed()
            .setTitle('チーム振り分け結果')
            .setDescription(output);
        interaction.reply({embed: [output]});
    }
}
