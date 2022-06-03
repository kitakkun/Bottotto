module.exports = {
  name: 'spl',
  description: 'Splatoon2の便利機能を提供します。',
  execute(message, args) {
    if (args[0] === 'h') {
      message.channel.send({
        embed: {
          title: 'splコマンドの使用方法',
          description: 'splコマンドで利用可能なオプションは下記のとおりです。\n\n`rule` ルールをランダムで選択します。\n`stage` ステージをランダムで選択します。'
        }
      });
    } else if (args[0] === 'rule') {
      const names = ['ガチエリア', 'ガチアサリ', 'ガチヤグラ', 'ナワバリバトル'];
      var item = names[Math.floor(Math.random()*names.length)];
      message.channel.send({
        embed: {
          title: "Splatoon2 ルール自動選択",
          description: "「" + item + "」に決定しました！"
        }
      });
    } else if (args[0] === 'stage') {
      const names = ['ムツゴ楼', 'アンチョビットゲームズ', 'ホテルニューオートロ', 'スメーシーワールド', 'モンガラキャンプ場', 'ショッツル鉱山', 'アジフライスタジアム', 'アロワナモール', 'デボン海洋博物館', 'ハコフグ倉庫', 'ザトウマーケット', 'Bバスパーク', 'エンガワ河川敷', 'モズク農園', 'マンタマリア号', 'タチウオパーキング', 'ホッケふ頭', 'チョウザメ造船', '海女美術大学', 'コンブトラック', 'ガンガゼ野外音楽堂', 'フジツボスポーツクラブ', 'バッテラストリート'];
      var item = names[Math.floor(Math.random()*names.length)];
      message.channel.send({
        embed: {
          title: "Splatoon2 ステージ自動選択",
          description: "「" + item + "」に決定しました！"
        }
      });
    }
  }
}
