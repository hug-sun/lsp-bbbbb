// task 的机制可以组合，比如每日任务就可以包含3个小任务 daily -> [ 登录，观看视频，投币 ]
const { execute: coin } = require("./coin");

const tasks = [];

function addTask(task) {
  tasks.push(task);
}

// 注册 task
addTask(coin);

exports.start = async function start() {
  // 并行的执行所有的任务
  for (const task of tasks) {
    await task();
  }
};
