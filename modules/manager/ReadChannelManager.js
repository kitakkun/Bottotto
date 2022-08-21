const {EventManager} = require("./EventManager");
const {execSync} = require('child_process');
const {PATH_TO_OPEN_JTALK, OPEN_JTALK_HTS_VOICE_PATH, OPEN_JTALK_DICTIONARY_PATH} = require("../../config.json");
const {ReadChannel} = require("../database");
const {
    joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus
} = require("@discordjs/voice");
const {makeDirSync} = require("fs-extra/lib/mkdirs/make-dir");
const fs = require("fs");

module.exports.ReadChannelManager = class ReadChannelManager {

    constructor() {
        this.eventManager = new EventManager();
        this.isPlaying = false;
    }

    #reset() {
        this.eventManager.reset();
        this.isPlaying = false;
    }

    /**
     * format text to read aloud
     * @param text input text
     * @param guild guild object
     * @returns {*} formatted text
     */
    #format_text(text, guild) {
        text = this.#ignore_url(text);
        text = this.#ignore_emoji(text);
        text = this.#resolve_role_id(text, guild);
        text = this.#resolve_member_id(text, guild);
        text = this.#resolve_text_channel_id(text, guild);
        return text;
    }

    // ignore urls
    #ignore_url(text) {
        return text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
    }

    #ignore_emoji(text) {
        text = text.replaceAll('<:[a-zA-Z0-9_]+:[0-9]+>', '');
        return text
    }

    // resolve role names
    #resolve_role_id(text, guild) {
        let roleIDs = text.match(/<@&\d{18}>/);
        if (roleIDs != null) {
            roleIDs = Array.from(roleIDs);
            const roles = guild.roles;
            for (let i = 0; i < roleIDs.length; i++) {
                const roleID = roleIDs[i].replace(/\D/g, '');
                const role = roles.cache.find(role => role.id === roleID);
                if (role != null) text = text.replaceAll(roleIDs[i], "@" + role.name);
            }
        }
        return text;
    }

    #resolve_member_id(text, guild) {
        let memberIDs = text.match(/<@\d{18}>/);
        if (memberIDs != null) {
            memberIDs = Array.from(memberIDs);
            const members = guild.members;
            for (let i = 0; i < memberIDs.length; i++) {
                const memberID = memberIDs[i].replace(/\D/g, '');
                const member = members.cache.find(member => member.id === memberID);
                if (member != null) text = text.replaceAll(memberIDs[i], "@" + member.displayName);
            }
        }
        return text;
    }

    #resolve_text_channel_id(text, guild) {
        let channelIDs = text.match(/<#\d{18}>/);
        if (channelIDs != null) {
            channelIDs = Array.from(channelIDs);
            const channels = guild.channels;
            for (let i = 0; i < channelIDs.length; i++) {
                const channelID = channelIDs[i].replace(/\D/g, '');
                const channel = channels.cache.find(channel => channel.id === channelID);
                if (channel != null) text = text.replaceAll(channelIDs[i], "テキストチャンネル" + channel.name);
            }
        }
        return text;
    }

    async speech(message) {

        if (this.isPlaying) {
            console.log("pushing");
            this.eventManager.push(message);
            return;
        }

        const entry = await ReadChannel.findOne({where: {guildId: message.guild.id}});
        if (!entry) {
            this.#reset();
            return;
        }
        if (entry.textChannelId !== message.channel.id) return;

        const directory_path = `./server/${entry.guildId}/`;
        makeDirSync(directory_path);

        const wav_filename = `temp.wav`;

        let text = message.content;
        text = this.#format_text(text, message.guild)

        // construct command string.
        const command = `echo "${text}" | \ 
                        ${PATH_TO_OPEN_JTALK} \
                        -m ${OPEN_JTALK_HTS_VOICE_PATH} \
                        -x ${OPEN_JTALK_DICTIONARY_PATH} \
                        -ow ${directory_path}${wav_filename} \
                        `;

        // create a wav file.
        try {
            execSync(command, (err, stdout, stderr) => {
                if (err) {
                    console.error(`stderr: ${stderr}`);
                }
                console.log(`stdout: ${stdout}`);
            });
        } catch (e) {
            console.log("error");
            return;
        }

        let connection = getVoiceConnection(entry.guildId);

        if (!connection) {
            connection = await joinVoiceChannel({
                channelId: entry.voiceChannelId,
                guildId: entry.guildId,
                adapterCreator: message.guild.voiceAdapterCreator
            });
        }

        const player = createAudioPlayer();
        const resource = createAudioResource(directory_path + wav_filename);

        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, async () => {
            console.log("speech finished");
            this.isPlaying = false;
            if (this.eventManager.hasEvent()) {
                console.log("re");
                fs.unlinkSync(directory_path + wav_filename);
                message = this.eventManager.pop();
                await this.speech(message);
            }
        });

        this.isPlaying = true;
        player.play(resource);
    }

    async checkVoiceState(oldState, newState) {


        const guild = oldState ? oldState?.guild : newState ? newState?.guild : null;

        if (!guild) return;

        const entry = await ReadChannel.findOne({where: {guildId: guild.id}});
        if (!entry) return;

        const connection = getVoiceConnection(guild.id);
        const voiceChannel = await guild.channels.resolve(entry.voiceChannelId);

        if (voiceChannel?.members.size === 1 && connection) {
            ReadChannel.destroy({where: {guildId: guild.id}})
                .then(_ => {
                    connection.disconnect();
                });
        }
    }

}