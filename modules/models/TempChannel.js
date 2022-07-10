const {Sequelize, DataTypes, Model} = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define("TempChannel", {
        tempChannelId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isNumeric: true,
                len: 18,
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
            allowNull: false,
            validate: {},
        },  // 一時チャンネルのタイプ（Voice, Text)
        bindingChannelId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isNumeric: true,
                len: 18,
            },
        },          // 一時チャンネルが紐付けられたチャンネルのID
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isNumeric: true,
                len: 18,
            },
        }          // ギルドID
    }, {});
};
