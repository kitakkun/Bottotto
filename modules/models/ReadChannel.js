const {Sequelize, DataTypes, Model} = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define("ReadChannel", {
        voiceChannelId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isNumeric: true,
                len: 18,
            },
        },   // 読み上げを行うボイスチャンネルのID
        textChannelId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isNumeric: true,
                len: 18,
            },
        },  // 読み上げ対象のテキストチャンネルID
        ownerId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isNumeric: true,
                len: 18,
            },
        },          // 読み上げ設定者のユーザーID
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isNumeric: true,
                len: 18,
            },
        },          // ギルドID
    }, {});
};
