const Sequelize = require("sequelize");

// データベースの定義
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite'
});

import {ReadChannel, ReadChannelStatus} from "./model/ReadChannel";
import {TempChannel} from "./model/TempChannel";

class DatabaseController {

    /**
     * 読み上げ登録処理
     * @param entry
     */
    async register_readChannel(entry: ReadChannel) : Promise<ReadChannelStatus> {

        // check whether readChannel function is already in use or not.
        const current = await ReadChannel.findOne({where: entry.guildId});
        // if already in use, notify that it is unavailable.
        if (current) return ReadChannelStatus.Unavailable;

        // 読み上げを登録
        await ReadChannel.create(entry);

        return ReadChannelStatus.SuccessfullyRegistered;
    }

    /**
     * 読み上げ解除処理
     * @param entry 削除する登録データ
     */
    async deregister_readChannel(entry: ReadChannel) {
        await TempChannel.destroy(entry);
    }

    /**
     * 一時チャンネルの登録処理
     * @param entry 登録するデータ
     */
    async register_tempChannel(entry: TempChannel) {
        await TempChannel.create(entry);
    }

    /**
     * 一時チャンネルの削除
     * @param entry 削除するデータ
     */
    async deregister_tempChannel(entry: TempChannel) {
        await TempChannel.destroy(entry);
    }

}