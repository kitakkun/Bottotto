module.exports = {
  name: 'dice',
  description: 'ダイスを振ります。TRPGで使えます。',
  execute(message, args) {
    if (args[0] === 'h') {
      message.channel.send({
        embed:
        {
          title: "diceコマンドの使い方",
          description: "ダイスを振ります第1引数にはダイスの数を、第2引数にはダイスの最大の目を入力してください。"
        }
      });
      return;
    }

    let num = NaN, max = NaN;

    if (args.length === 2) {
      num = Number(args[0]);
      max = Number(args[1]);
    } else if (args.length === 1 && args[0].match("[0-9]+d[0-9]+")) {
      var array = args[0].split("d");
      num = Number(array[0]);
      max = Number(array[1]);
    }
    if (isNaN(num) || isNaN(max)) return;

    let result = "";

    for (let i = 0; i < num; i++) {
      if (i !== 0) result += ", ";
      result += getRandInt(1, max);
    }

    message.channel.send({
      embed:
      {
        title: "dice: " + num + "d" + max,
        description: "ダイスの目は" + result + "でした。"
      }
    });

    function getRandInt(min, max) {
      return Math.floor(Math.random() * max) + min;
    }
  }
}
