const { Sequelize, DataTypes, Model } = require('sequelize');
const { sequelize } = require('../DatabaseController');

// 一時チャンネルの管理テーブル
export class TempChannel extends Model {
    declare tempChannelId: string;
    declare tempRoleId: string;
    declare channelType: number;
    declare bindingChannelId: string;
    declare guildId: string;
}

TempChannel.init({
    tempChannelId: {
        type: DataTypes.STRING,
        validate: {
            isNumeric: true,
            len: 18,
            notNull: true
        },
    },   // 一時チャンネルのID
    tempRoleId: {
        type: DataTypes.STRING,
        validate: {
            isNumeric: true,
            len: 18,
        },
    },   // 一時役職のID
    channelType: {
        type: DataTypes.INTEGER,
        validate: {
            isAlpha: true,
            notNull: true,
        },
    },  // 一時チャンネルのタイプ（Voice, Text)
    bindingChannelId: {
        type: DataTypes.STRING,
        validate: {
            isNumeric: true,
            len: 18,
            notNull: true
        },
    },          // 一時チャンネルが紐付けられたチャンネルのID
    guildId: {
        type: DataTypes.STRING,
        validate: {
            isNumeric: true,
            len: 18,
            notNull: true
        },
    },          // ギルドID
}, {
    sequelize,
    modelName: "TempChannel"
});
