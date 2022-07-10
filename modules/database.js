const {Sequelize} = require("sequelize");

// データベースの定義
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite'
});

const TempChannel = require('./models/TempChannel')(sequelize);
const ReadChannel = require('./models/ReadChannel')(sequelize);
const Rank = require('./models/Rank')(sequelize);

async function syncDatabase() {
    await TempChannel.sync();
    await ReadChannel.sync();
    await Rank.sync();
}

module.exports = {
    sequelize,
    TempChannel,
    ReadChannel,
    Rank,
    syncDatabase,
};

