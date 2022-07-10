const { Sequelize, DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define("Rank", {
        userId: {
            type: DataTypes.STRING,
            validate: {
                isNumeric: true,
                len: 18,
            },
        },   // ユーザーID
        guildId: {
            type: DataTypes.STRING,
            validate: {
                isNumeric: true,
                len: 18,
            },
        },    // ギルドID
        exp: {
            type: DataTypes.INTEGER,
            validate: {
            },
        },  // 経験値
        level: {
            type: DataTypes.INTEGER,
            validate: {
            },
        },  // レベル
    }, { });
};
