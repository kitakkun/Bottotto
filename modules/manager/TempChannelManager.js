const {TempChannel} = require('../database');
const {EventManager} = require("./EventManager");

module.exports.TempChannelManager = class TempChannelManager {

    constructor() {
        this.eventManager = new EventManager();
        this.busy = false;
    }

    /**
     * VoiceStateUpdateの処理
     * @param oldState
     * @param newState
     */
    async processVoiceEvent(oldState, newState) {

        if (this.busy) {
            this.eventManager.push([oldState, newState]);
            return;
        }

        this.busy = true;

        // create a temporal channel and corresponding role.
        await this.#createTempChannel(newState);
        // delete a temporal channel and corresponding role.
        await this.#deleteTempChannel(oldState);

        // update members' role
        await this.#updateMembersRole(oldState, newState);

        while (this.eventManager.hasEvent()) {
            let param = this.eventManager.pop();
            await this.processVoiceEvent(param[0], param[1]);
        }

        this.busy = false;
    }

    /**
     * create a new temporal channel and role.
     * @param newState
     * @returns {Promise<void>}
     */
    async #createTempChannel(newState) {

        const channelManager = newState?.guild.channels;
        const roleManager = newState?.guild.roles;

        const memberCount = newState?.channel?.members.size;

        const entry = await TempChannel.findOne({
            where: {bindingChannelId: newState?.channelId, guildId: newState?.guild.id}
        });

        if (channelManager === null || roleManager === null || memberCount !== 1 || entry) return;

        const tempName = this.#getTempName(newState?.channel.name);

        // create a temporary role.
        let tempRole = await roleManager.create({
            name: tempName,
            reason: "to provide tempChannel feature"
        });

        // create a temporary channel.
        let tempChannel = await channelManager.create(tempName, {
            reason: "to provide tempChannel feature",
            parent: newState?.channel.parent,
            permissionOverwrites: [
                {
                    id: tempRole.id,
                    allow: ["VIEW_CHANNEL"],
                },
                {
                    id: newState?.guild.roles.everyone.id,
                    deny: ["VIEW_CHANNEL"],
                }
            ]
        });

        await tempChannel.send(`ここは「${newState?.channel.name}」チャンネル専用の聞き専チャンネルです．ボイスチャンネル内のメンバーが0人になった時点で自動消滅します．`);

        // register to database.
        await TempChannel.create({
            tempChannelId: tempChannel.id,
            tempRoleId: tempRole.id,
            channelType: tempChannel.type,
            bindingChannelId: newState?.channel.id,
            guildId: newState?.guild.id,
        });
    }

    /**
     * delete a temporal channel and corresponding temporal role.
     * @param oldState
     * @returns {Promise<void>}
     */
    async #deleteTempChannel(oldState) {

        const channelManager = oldState?.guild.channels;
        const roleManager = oldState?.guild.roles;
        const memberCount = oldState?.channel?.members.size;

        if (channelManager === null || roleManager === null || memberCount !== 0) return;

        await TempChannel.findOne({
            where: {bindingChannelId: oldState?.channelId, guildId: oldState?.guild.id}
        }).then(async (entry) => {
            if (!entry) return;
            await roleManager.delete(entry.tempRoleId);
            await channelManager.delete(entry.tempChannelId);
            await TempChannel.destroy({
                where: {
                    tempChannelId: entry.tempChannelId,
                    tempRoleId: entry.tempRoleId,
                    channelType: entry.channelType,
                    bindingChannelId: entry.bindingChannelId,
                    guildId: entry.guildId,
                }
            });
        }).catch(async (e) => {
            console.error(e);
            await TempChannel.destroy({
                where: {bindingChannelId: oldState?.channelId, guildId: oldState?.guild.id}
            });
        });

    }

    async #updateMembersRole(oldState, newState) {

        await TempChannel.findOne({
            where: {bindingChannelId: oldState?.channelId, guildId: oldState?.guild.id}
        }).then(async (entry) => {
            if (!entry) return;
            await oldState?.member.roles.remove(entry.tempRoleId).catch(async (e) => {
                await TempChannel.destroy({where: {bindingChannelId: entry.channelId, guildId: entry.guildId}});
            });
        });

        await TempChannel.findOne({
            where: {bindingChannelId: newState?.channelId, guildId: newState?.guild.id}
        }).then(async (entry) => {
            if (!entry) return;
            await newState?.member.roles.add(entry.tempRoleId).catch(async (e) => {
                await TempChannel.destroy({where: {bindingChannelId: entry.channelId, guildId: entry.guildId}});
            });
        });
    }

    #getTempName(basename) {
        return basename + "（聞き専）";
    }
}