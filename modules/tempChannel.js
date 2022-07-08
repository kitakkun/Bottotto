const file = require('./file.js');

const {tempChannels} = require("./dbcontroller.js");
const {
  get_voice_activity_type, VOICE_ACTIVITY_JOIN,
  VOICE_ACTIVITY_MOVE, VOICE_ACTIVITY_LEAVE
} = require('./util/VoiceActivity.ts');
const EventManager = require('./eventmanager.js');
const {ChannelType} = require("discord-api-types/v9");
tcEM = new EventManager();

async function create_temp_role_and_channel(binding_channel) {

  const name = binding_channel?.name + '(temporal)';
  // create a private role
  const role = await binding_channel?.guild.roles.create({
    name: name,
  }).then(console.log).catch(console.error);
  // create a temporal text channel
  const channel = await binding_channel?.guild.channels.create({
    name: name,
    type: ChannelType.GuildText,
  }).then(console.log).catch(console.error);

  return [role, channel];
}

async function register_bindings(binding_channel, role, channel)
{

}

exports.manage_temp_text_channel = async function(oldState, newState) {

  // detect JOIN or LEAVE or MOVE or MUTE_OR_DEAFEN
  const activity_type = get_voice_activity_type(oldState, newState);

  const new_channel = newState?.channel;
  const old_channel = oldState?.channel;

  if (activity_type === VOICE_ACTIVITY_JOIN)
  {
    let role, channel;
    // 初めて入った場合
    if (new_channel?.members?.size === 1)
    {
      await create_temp_role_and_channel(new_channel);
    }
    // ロールの付与
    new_channel?.members.each(member => {
      member.roles.add(role);
    });
  }
  else if (activity_type === VOICE_ACTIVITY_LEAVE)
  {
    // 完全に誰もいなくなった場合
    if (old_channel?.members?.size === 0)
    {
      // delete temporal text channel
      old_channel?.guild.channels.delete()
    }
  }

}
exports.manageTC = async function manage(oldState, newState) {

  if (tcEM.busy) {
    console.log("now busy... added to eventque.");
    tcEM.addToQueue(oldState, newState);
    return;
  }

  tcEM.busy = true;



  const voiceChannels = [oldState.channel, newState.channel].filter(item => item != null && item !== guild.afkChannel && item.name !== "グループ作成");

  // チャンネルの作成と管理
  for (let i = 0; i < voiceChannels.length; i++) {

    const voiceChannel = voiceChannels[i];
    const name = voiceChannel.name.replace(' ', '-').replace('(', '').replace(')', '').toLowerCase() + "（聞き専）";
    const connectedMembers = voiceChannel.members.size;

    const exist = associations.some(as => as.voiceChannel === voiceChannel.id);

    if (!exist && connectedMembers > 0) {
      let role = await guild.roles.create({data: {name: name}});
      let bot = await guild.roles.cache.find(role => role.name.toLowerCase() === 'bot');
      const permissionOverwrites = [
        {id: role.id, allow: ['VIEW_CHANNEL']},
        {id: guild.roles.everyone.id, deny: ['VIEW_CHANNEL']}
      ];
      if (bot != null) permissionOverwrites.push({id: bot.id, allow: ['VIEW_CHANNEL']});
      let tempChannel = await guild.channels.create(name, {
        parent: voiceChannel.parent,
        permissionOverwrites: permissionOverwrites
      });

      let newAssociation = {role: role.id, textChannel: tempChannel.id, voiceChannel: voiceChannel.id};
      associations.push(newAssociation);

    } else if (connectedMembers === 0) {

      const association = associations.find(as => as.voiceChannel === voiceChannel.id);

      if (association != null) {
        await guild.channels.resolve(association.textChannel).delete();
        await guild.roles.resolve(association.role).delete();
      }

      associations = associations.filter(as => as !== association);
    }
  }

  // 役職付与・はく奪
  const util = require('./util.js');

  if (util.getUserAction(oldState, newState) !== "MUTED_OR_DEAFENED") {
    // はく奪
    if (oldState.channel != null) {
      const association = associations.find(as => as.voiceChannel === oldState.channel.id);
      if (association != null) await oldState.member.roles.remove(association.role);
    }
    // 付与
    if (newState.channel != null) {
      const association = associations.find(as => as.voiceChannel === newState.channel.id);
      if (association != null) await newState.member.roles.add(association.role);
    }
  }
  file.writeJSONSync(path, associations);

  tcEM.busy = false;

  if (tcEM.isQueueStacked()) {
    console.log("イベントキューに情報が蓄積されていたため、関数を再帰的に呼び出しています…");
    const args = tcEM.getQueue();
    await manage(args[0], args[1]);
  }

  return new Promise((resolve, reject) => {
    resolve();
  });
}

exports.manageVC = async function manageVC(oldState, newState) {
  const guild = oldState.guild;

  const path = file.getPath(guild, 'tempChannel/voiceChannels.json');
  let associations = file.readJSONSync(path, []);

  if (newState.channel != null && newState.channel.name === 'グループ作成') {
    let channel = await guild.channels.create(oldState.member.displayName + 'のグループ', {type:'voice', parent: newState.channel.parent, position: newState.channel.rawPosition, userLimit: 16});
    await newState.member.voice.setChannel(channel);
    associations.push(channel.id);
  }

  // チャンネル削除
  const voiceChannels = [oldState.channel, newState.channel].filter(item => item != null);

  for (var i = 0; i < voiceChannels.length; i++) {
    const voiceChannel = voiceChannels[i];
    if (associations.some(id => voiceChannel.id === id)) {
      const connectedMembers = voiceChannel.members.size;
      if (connectedMembers === 0) {
        guild.channels.resolve(voiceChannel.id).delete();
        associations = associations.filter(as => as !== voiceChannel.id);
      }
    }
  }

  file.writeJSONSync(path, associations);
}
