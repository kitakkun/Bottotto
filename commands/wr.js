module.exports = {
  name: 'wr',
  description: 'wolframへのURLを生成します。',
  execute(message, args) {
    for (var i = 0; i < args.length; i++) {
      args[i] = encodeURIComponent(args[i])
    }
    output = "Wolfram大先生の解答はこちらです⇒ https://ja.wolframalpha.com/input/?i=" + args.join('+');
    message.channel.send(output).then(ms => ms.suppressEmbeds(true));
  }
}
