const { Sequelize, DataTypes, Model } = require('sequelize');
const { sequelize } = require('../DatabaseController');

export enum ReadChannelStatus {
    Unavailable, Available, SuccessfullyRegistered,
}

export class ReadChannel extends Model { }

ReadChannel.init({
    voiceChannelId: {
        type: Sequelize.STRING,
        validate: {
            isNumeric: true,
            len: 18,
            notNull: true
        },
    },   // 読み上げを行うボイスチャンネルのID
    textChannelId: {
        type: Sequelize.STRING,
        validate: {
            isNumeric: true,
            len: 18,
            notNull: true
        },
    },  // 読み上げ対象のテキストチャンネルID
    ownerId: {
        type: Sequelize.STRING,
        validate: {
            isNumeric: true,
            len: 18,
            notNull: true
        },
    },          // 読み上げ設定者のユーザーID
    guildId: {
        type: Sequelize.STRING,
        validate: {
            isNumeric: true,
            len: 18,
            notNull: true
        },
    },          // ギルドID
}, {
    sequelize,
    modelName: "ReadChannel"
});
