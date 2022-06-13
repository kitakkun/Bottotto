exports.writeJSONSync = (path, data) => {
  // フォルダが存在しない場合作成する
  const fsEx = require('fs-extra');
  fsEx.outputFileSync(path, JSON.stringify(data));
}
// JSONファイルを読み込む。第２引数defaultValueはデータが存在しなかった場合に返す値。
exports.readJSONSync = (path, defaultValue=null) => {
  const fs = require('fs');
  if (fs.existsSync(path)) {
    const rawData = fs.readFileSync(path, 'utf-8');
    const data = JSON.parse(rawData || "null");
    if (data == null) return defaultValue;
    return data;
  }
  return defaultValue;
}
// guildオブジェクトとファイルパスからpathを生成
exports.getPath = (guild, filepath) => {
  const root = require('../config.json').root;
  return root + guild.id + "/" + filepath;
}
