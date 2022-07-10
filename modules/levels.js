exports.manage = (...args) => {
    const util = require('./util.js');
    const file = require('./file.js');

    // イベントの分別（message, voiceStateUpdate, messageReactionAddのいずれか）
    const eventType = util.getEventType(args);

    // guild, memberオブジェクトの取得
    let guild, member;
    if (eventType === 'message' || eventType === 'voiceStateUpdate') {
        guild = args[0].guild;
        member = args[0].member;
    } else if (eventType === 'messageReactionAdd') {
        guild = args[0].message.guild;
        member = args[1];
    }

    const path = file.getPath(guild, "levels/levels.json");   // 経験値管理用データのパス
    let memberStates = file.readJSONSync(path, []);

    // データが存在していなければ
    if (!memberStates.some(ms => ms.id === member.id)) {
        // 新規に登録
        ms = {
            id: member.id,
            messageTimestamp: null,
            reactionTimestamp: null,
            voiceTimestamp: null,
            exp: 0,
            level: 1,
            rank: null,
            notify: false
        };
        memberStates.push(ms);
    }

    // 対象ユーザーのデータへの参照を得る
    memberState = memberStates.find(ms => ms.id === member.id);

    const date = new Date();
    const nowTime = date.getTime();

    const gainedExp = calcExp(eventType, memberState);
    updateMemberTimestamp(eventType, memberState, gainedExp);
    updateMemberLevel(memberState, gainedExp);
    updateMembersRank(memberStates);

    // レベル管理用ファイルデータ更新
    file.writeJSONSync(path, memberStates);

    // 経験値算出
    function calcExp(eventType, memberState) {
        let exp = 0;
        if (eventType === 'message') {
            ts = memberState.messageTimestamp;
            if (ts == null || getElapsedMin(ts, nowTime) > 1) {
                exp = 5;
            }
        } else if (eventType === 'messageReactionAdd') {
            ts = memberState.reactionTimestamp;
            if (ts == null || getElapsedMin(ts, nowTime) > 1) {
                exp = 5;
            }
        } else if (eventType === 'voiceStateUpdate') {
            ts = memberState.voiceTimestamp;
            userAction = util.getUserAction(args[0], args[1]);
            if ((userAction === "LEAVE" || args[1].channel === guild.afkChannel) && ts != null) {
                exp = Math.floor(getElapsedMin(ts, nowTime));
            }
        }

        // TODO: 経験値倍率補正
        const mag = file.readJSONSync(file.getPath(guild, "levels/expconf.json"));
        if (mag != null) {
            exp *= mag;
            // for (var i = 0; i < expAdjusts.length; i++) {
            //   item = expAdjusts[i];
            //   startDate = new Date(item.startTime);
            //   endDate = new Date(item.endTime);
            //   if (item.option == "allYear") {
            //     startDate.setFullYear(date.getFullYear());
            //     endDate.setFullYear(date.getFullYear());
            //   }
            //   startTime = startDate.getTime();
            //   endTime = endDate.getTime();
            //   if (startTime <= nowTime && nowTime <= endTime) {
            //     exp *= item.x;
            //   }
            // }

        }
        return Math.floor(exp);
    }

    // タイムスタンプの更新
    function updateMemberTimestamp(eventType, memberState, gainedExp) {
        if (eventType == 'message') {
            if (gainedExp != 0) {
                memberState.messageTimestamp = nowTime;
            }
        } else if (eventType == 'messageReactionAdd') {
            if (gainedExp != 0) {
                memberState.reactionTimestamp = nowTime;
            }
        } else if (eventType == 'voiceStateUpdate') {
            userAction = util.getUserAction(args[0], args[1]);
            if (userAction == "JOIN" && args[1].channel != guild.afkChannel || userAction == "MOVE" && args[0].channel == guild.afkChannel) {
                memberState.voiceTimestamp = nowTime;
            }
            if (gainedExp != 0 || userAction == "LEAVE" || args[1].channel == guild.afkChannel) {
                memberState.voiceTimestamp = null;
            }
        }
    }

    // 経験値付与とレベル更新
    function updateMemberLevel(memberState, gainedExp) {
        memberState.exp += gainedExp;
        // 更新前レベルを記憶しておく
        const oldLevel = memberState.level;

        const levels = file.readJSONSync('modules/levels.json', []);
        // レベル更新
        levels.push(memberState.exp);
        levels.sort(
            function (a, b) {
                return (a < b ? -1 : 1);
            }
        );
        memberState.level = levels.lastIndexOf(memberState.exp) + 1;
        // レベル更新通知
        if (oldLevel != memberState.level) {
            if (memberState.notify) {
                const member = guild.members.resolve(memberState.id);
                if (member != null) {
                    member.send({
                        embed: {
                            title: "レベルアップしました！",
                            description: "LEVEL **" + oldLevel + "** => LEVEL **" + memberState.level + "**\nat " + guild.name + "\nおめでとうございます :tada:"
                        }
                    });
                }
            }
        }
    }

    // ランク更新
    function updateMembersRank(memberStates) {
        memberStates.sort(function (a, b) {
            if (a.exp > b.exp) return -1;
            if (a.exp < b.exp) return 1;
            return 0;
        });

        for (var i = 0; i < memberStates.length; i++) {
            memberStates[i].rank = i + 1;
        }
    }

    // 時間経過を取得（分）
    function getElapsedMin(before, after) {
        return (after - before) / 1000 / 60;
    }
}
