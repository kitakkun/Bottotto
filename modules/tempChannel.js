const file = require('./file.js');

const EventManager = require('./eventmanager.js');
tcEM = new EventManager();

exports.manageTC = async function manage(oldState, newState) {

  if (tcEM.busy) {
    console.log("now busy... added to eventque.");
    tcEM.addToQueue(oldState, newState);
    return;
  }

  tcEM.busy = true;

  const file = require('./file.js');
  const guild = oldState.guild;
  const path = file.getPath(guild, "tempChannel/textChannels.json");
  let associations = file.readJSONSync(path, []);

  const voiceChannels = [oldState.channel, newState.channel].filter(item => item != null && item !== guild.afkChannel && item.name !== "グループ作成");

  // チャンネルの作成と管理
  for (var i = 0; i < voiceChannels.length; i++) {

    const voiceChannel = voiceChannels[i];
    const name = voiceChannel.name.replace(' ', '-').replace('(', '').replace(')', '').toLowerCase() + "（聞き専）";
    const connectedMembers = voiceChannel.members.array().length;

    const exist = associations.some(as => as.voiceChannel === voiceChannel.id);

    if (!exist && connectedMembers > 0) {
      let role = await guild.roles.create({data: {name: name}});
      let bot = await guild.roles.cache.find(role => role.name.toLowerCase() === 'bot');
      var permissionOverwrites = [
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
    manage(args[0], args[1]);
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
    newState.member.voice.setChannel(channel);
    associations.push(channel.id);
  }

  // チャンネル削除
  const voiceChannels = [oldState.channel, newState.channel].filter(item => item != null);

  for (var i = 0; i < voiceChannels.length; i++) {
    const voiceChannel = voiceChannels[i];
    if (associations.some(id => voiceChannel.id === id)) {
      const connectedMembers = voiceChannel.members.array().length;
      if (connectedMembers === 0) {
        guild.channels.resolve(voiceChannel.id).delete();
        associations = associations.filter(as => as !== voiceChannel.id);
      }
    }
  }

  file.writeJSONSync(path, associations);
}
