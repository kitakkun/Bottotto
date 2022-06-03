module.exports = class EventManager {
  constructor() {
    this.eventqueue = [];
    this.busy = false;
  }
  // イベントキューに引数を登録
  addToQueue(...args) {
    this.eventqueue.push(args);
  }
  // イベントキューに溜まっているか返す
  isQueueStacked() {
    return this.eventqueue.length > 0;
  }
  // 引数を取得
  getQueue() {
    return this.eventqueue.shift();
  }
}
