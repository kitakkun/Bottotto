exports.getUserAction = (oldState, newState) => {
  const oldUserChannel = oldState.channel;
  const newUserChannel = newState.channel;
  if (oldUserChannel == null && newUserChannel != null) {
    // console.log("JOINED");
    return "JOIN";
  } else if (oldUserChannel != null && newUserChannel == null) {
    // console.log("LEAVED");
    return "LEAVE";
  } else if (oldUserChannel !== newUserChannel) {
    // console.log("MOVED");
    return "MOVE";
  } else {
    // console.log("MUTED OR DEAFENED");
    return "MUTED_OR_DEAFENED";
  }
}

exports.getEventType = (args) => {
  const Discord = require('discord.js');
  if (args.length === 1 && args[0] instanceof Discord.Message) {
    return 'message';
  } else if (args.length === 2 && args[0] instanceof Discord.VoiceState && args[1] instanceof Discord.VoiceState) {
    return 'voiceStateUpdate';
  } else if (args.length === 2 && args[0] instanceof Discord.MessageReaction && args[1] instanceof Discord.User) {
    return 'messageReactionAdd';
  } else {
    return 'messageReactionAdd';
  }
}
