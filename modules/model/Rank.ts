const { Sequelize, DataTypes, Model } = require('sequelize');
const { sequelize } = require('../DatabaseController');

// 一時チャンネルの管理テーブル
export class Rank extends Model { }

Rank.init({
    userId: {
        type: Sequelize.STRING,
        validate: {
            isNumeric: true,
            len: 18,
            notNull: true
        },
    },   // ユーザーID
    guildId: {
        type: Sequelize.STRING,
        validate: {
            isNumeric: true,
            len: 18,
            notNull: true
        },
    },    // ギルドID
    exp: {
        type: Sequelize.INTEGER,
        validate: {
            notNull: true
        },
    },  // 経験値
    level: {
        type: Sequelize.INTEGER,
        validate: {
            notNull: true
        },
    },  // レベル
}, {
    sequelize,
    modelName: "Rank"
});
