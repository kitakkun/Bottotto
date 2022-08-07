const {EventManager} = require("./EventManager");
const {execSync} = require('child_process');
const {PATH_TO_OPEN_JTALK, OPEN_JTALK_HTS_VOICE_PATH, OPEN_JTALK_DICTIONARY_PATH} = require("../../config.json");
const {ReadChannel} = require("../database");
const {
    joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus
} = require("@discordjs/voice");
const {makeDirSync} = require("fs-extra/lib/mkdirs/make-dir");

module.exports.ReadChannelManager = class ReadChannelManager {

    constructor() {
        this.eventManager = new EventManager();
        this.isPlaying = false;
    }

    #reset() {
        this.eventManager.reset();
        this.isPlaying = false;
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
        // ignore urls
        text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');

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