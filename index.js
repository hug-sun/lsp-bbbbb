const { execute: coin } = require("./src/task/coin");
(async () => {
  // 执行每日任务
  // 1. 每日登陆
  // 2. 每日观看视频
  // 3. 每日投币
  // tasking
  // 先实现投币任务吧
  // 给定一个 视频 aid ，然后完成投币
  // task 的机制可以组合，比如每日任务就可以包含3个小任务 daily -> [ 登录，观看视频，投币 ]
  const tasks = [coin];
  // 并行的执行所有的任务
  for (const task of tasks) {
    await task();
  }
})();
