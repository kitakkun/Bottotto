/**
 * @file implementation of 'read' command.
 */
const {SlashCommandBuilder} = require("@discordjs/builders");
const {joinVoiceChannel, getVoiceConnection} = require('@discordjs/voice');
const {MessageEmbed} = require("discord.js");
const {ReadChannel} = require("../modules/database");

module.exports = {
    help: new MessageEmbed()
        .setTitle("readコマンドヘルプ")
        .setDescription("`/read s`で読み上げ開始、`/read e`で読み上げを終了します。"),
    data: new SlashCommandBuilder()
        .setName('read')
        .setDescription('コマンドが実行されたテキストチャンネル内の書き込みを読み上げます。')
        .addSubcommand(subcommand =>
            subcommand.setName('s')
                .setDescription('読み上げを開始します')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('e')
                .setDescription('読み上げを終了します')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('fe')
                .setDescription('強制的に読み上げ設定を解除します')
        )
    ,
    async execute(interaction) {

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 's':
                await start(interaction);
                break;
            case 'e':
                await end(interaction);
                break;
            case 'fe':
                await force_end(interaction);
                break;
        }
    }
}

/**
 * activate read-aloud function.
 * @param interaction
 * @returns {Promise<void>}
 */
async function start(interaction) {

    // check if this feature is already in use.
    const current_configuration = await ReadChannel.findOne({where: {guildId: interaction.guildId}});

    // if already in use, notify that the service is unavailable now.
    if (current_configuration) {
        await interaction.reply("現在、既に他のボイスチャンネルで読み上げを行っているため読み上げを開始できません。");
        return;
    }

    const voiceChannelId = interaction.member?.voice?.channelId;
    const textChannelId = interaction.channelId;
    const ownerId = interaction.member?.id;
    const guildId = interaction.guildId;

    await ReadChannel.create({
        voiceChannelId: voiceChannelId,
        textChannelId: textChannelId,
        ownerId: ownerId,
        guildId: guildId,
    }).then(async (_) => {

        await joinVoiceChannel({
            channelId: voiceChannelId,
            guildId: guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator
        });
        await interaction.reply({
            embeds: [
                new MessageEmbed().setTitle("テキスト読み上げを開始します！")
                    .setDescription("以後 #" + interaction.channel.name + " に書き込まれた内容を自動読み上げするよ！")
            ]
        });
    }).catch(e => {
        console.log(e);
        interaction.reply("エラーが発生しました！");
    });
}

/**
 * deactivate read-aloud function.
 * @param interaction
 * @returns {Promise<void>}
 */
async function end(interaction) {

    const current_configuration = await ReadChannel.findOne({where: {guildId: interaction.guildId}});

    if (!current_configuration) {
        await interaction.reply("読み上げを開始していません．");
        return;
    }

    if (current_configuration.ownerId !== interaction.member?.id) {
        await interaction.reply("読み上げの解除は設定者のみが行うことができます．");
        return;
    }

    await ReadChannel.destroy({where: {guildId: interaction.guildId}});

    await interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("テキスト読み上げを終了します！")
                .setDescription("じゃあの。また使ってくださいな。")
        ]
    });


    const connection = getVoiceConnection(current_configuration.guildId);
    if (connection) connection.disconnect();

}

async function force_end(interaction) {

    const current_configuration = await ReadChannel.findOne({where: {guildId: interaction.guildId}});

    if (!current_configuration) {
        await interaction.reply("読み上げを開始していません．");
        return;
    }

    await ReadChannel.destroy({where: {guildId: interaction.guildId}});

    await interaction.reply({
        embeds: [
            new MessageEmbed()
                .setTitle("テキスト読み上げを終了します！")
                .setDescription("強制的に読み上げ設定を解除しました．")
        ]
    });

    const connection = getVoiceConnection(current_configuration.guildId);
    if (connection) connection.disconnect();
}