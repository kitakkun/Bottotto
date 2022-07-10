export enum VoiceActivityType {
    Join, Move, Leave, MuteOrDeafen
}

/**
 * ボイスチャンネルの行動を取得します
 * @param oldState
 * @param newState
 */
export function getVoiceActivityType(oldState, newState) {

    const oldChannel = oldState?.channel;
    const newChannel = newState?.channel;

    if (oldState == null && newChannel != null) {
        return VoiceActivityType.Join;
    } else if (oldChannel != null && newChannel == null) {
        return VoiceActivityType.Leave;
    } else if (oldChannel != newChannel) {
        return VoiceActivityType.Move;
    } else {
        return VoiceActivityType.MuteOrDeafen;
    }
}