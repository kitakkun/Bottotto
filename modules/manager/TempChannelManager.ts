import { TempChannel } from '../model/TempChannel';

class TempChannelManager {

    /**
     * VoiceStateUpdateの処理
     * @param oldState
     * @param newState
     */
    async processVoiceEvent(oldState, newState) {

        const oldChannel = oldState?.channel;
        const newChannel = newState?.channel;

        let channelManager = undefined;
        let roleManager = undefined;

        if (newChannel) {

            channelManager = newChannel.guild.channels;
            roleManager = newChannel.guild.roles;

            const memberCount = newChannel.members.length;

            if (memberCount == 1) {

                // create a temporary channel.
                let tempChannel = await channelManager.create({
                    name: "kikisen",
                    reason: "to provide tempChannel feature",
                }).then(console.log).catch(console.error);

                // create a temporary role.
                let tempRole = await roleManager.create({
                    name: "kikisen",
                    reason: "to provide tempChannel feature"
                }).then(console.log).catch(console.error);

                // register to database.
                await TempChannel.create({
                    tempChannelId: tempChannel.id,
                    tempRoleId: tempRole.id,
                    channelType: tempChannel.type,
                    bindingChannelId: newChannel.id,
                    guildId: newChannel.guildId,
                });

                // add role to the member.
                newState.member.roles.add(tempRole);

            } else {

                let entry = await TempChannel.findOne({ where: { bindingChannelId: newChannel.id } });

                if (entry) {

                    await newState.member.roles.add(entry.tempRoleId);

                }

            }

        }

        if (oldChannel) {

            channelManager = newChannel.guild.channels;
            roleManager = newChannel.guild.roles;

            const memberCount = newChannel.members.length;

            if (memberCount == 0) {

                let entry = await TempChannel.findOne({
                    where: { bindingChannelId: oldChannel.id }
                });

                if (entry) {

                    await roleManager.resolve(entry.tempRoleId).delete();
                    await channelManager.resolve(entry.tempChannelId).delete();
                    await TempChannel.destroy(entry);

                }

            } else {

                let entry = await TempChannel.findOne({ where: { bindingChannelId: newChannel.id } });

                if (entry) {

                    await newState.member.roles.remove(entry.tempRoleId);

                }

            }

        }
    }
}