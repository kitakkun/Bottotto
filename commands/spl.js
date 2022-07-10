const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");
module.exports = {
    help: new MessageEmbed()
        .setTitle('splコマンドの使用方法')
        .setDescription('splコマンドで利用可能なオプションは下記のとおりです。\n\n`rule` ルールをランダムで選択します。\n`stage` ステージをランダムで選択します。'),
    data: new SlashCommandBuilder()
        .setName('spl')
        .setDescription('Splatoon2の便利機能')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('抽選を行う要素を選択')
                .addChoices({name: 'rule', value: 'rule'}, {name: 'stage', value: 'stage'})
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        const choice = interaction.options.getString('type');

        if (choice === 'rule') {
            const names = ['ガチエリア', 'ガチアサリ', 'ガチヤグラ', 'ナワバリバトル'];
            let item = names[Math.floor(Math.random() * names.length)];
            await interaction.reply({embeds: [new MessageEmbed().setTitle("Splatoon2 ルール自動選択").setDescription("「" + item + "」に決定しました！")]});
            return;
        }

        if (choice === 'stage') {
            const names = ['ムツゴ楼', 'アンチョビットゲームズ', 'ホテルニューオートロ', 'スメーシーワールド', 'モンガラキャンプ場', 'ショッツル鉱山', 'アジフライスタジアム', 'アロワナモール', 'デボン海洋博物館', 'ハコフグ倉庫', 'ザトウマーケット', 'Bバスパーク', 'エンガワ河川敷', 'モズク農園', 'マンタマリア号', 'タチウオパーキング', 'ホッケふ頭', 'チョウザメ造船', '海女美術大学', 'コンブトラック', 'ガンガゼ野外音楽堂', 'フジツボスポーツクラブ', 'バッテラストリート'];
            let item = names[Math.floor(Math.random() * names.length)];
            await interaction.reply({embeds: [new MessageEmbed().setTitle("Splatoon2 ステージ自動選択").setDescription("「" + item + "」に決定しました！")]});
        }
    }
}
