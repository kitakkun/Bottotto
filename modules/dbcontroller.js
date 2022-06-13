import Sequelize from "sequelize";
import {getVoiceConnection, joinVoiceChannel} from "@discordjs/voice";

const UNSUCCESSFUL = -1;
const SUCCESSFUL = 0;

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite'
});

// 一時チャンネルの管理
const tempChannel = sequelize.define('tempChannel', {
    channelId: Sequelize.STRING,            // チャンネルID
    bindingChannelId: Sequelize.STRING,     // 紐づけのチャンネルのID
    channelType: Sequelize.STRING,          // チャンネルタイプ(text, voice)
    guildId: Sequelize.STRING,              // ギルドID
});

// 読み上げチャンネルの管理
const readChannel = sequelize.define('readChannel', {
    voiceChannelId: Sequelize.STRING,   // 読み上げを行うボイスチャンネルID
    targetChannelId: Sequelize.STRING,  // 読み上げ対象のチャンネルID
    ownerId: Sequelize.STRING,          // 読み上げ設定者のユーザーID
    guildId: Sequelize.STRING,          // ギルドID
});

module.exports = {
    sequelize,
    tempChannel,
    readChannel,
};

// 読み上げ登録
async function register_read(ownerId, guildId, targetChannelId, voiceChannelId) {

    // 現在設定済みかどうかチェック
    const current = await readChannel.findOne({ where: {guildId: guildId} });
    if (current) return UNSUCCESSFUL;

    // 読み上げを登録
    await readChannel.create({
        voiceChannelId: voiceChannelId,
        targetChannelId: targetChannelId,
        ownerId: ownerId,
        guildId: guildId,
    });

    return SUCCESSFUL;
}

// 読み上げ解除
async function unregister_read(guildId) {
    await readChannel.destroy({ where: {guildId: guildId}});
    const connection = await getVoiceConnection(guildId);
    if (connection) connection.disconnect();
}

// 一時チャンネルの作成