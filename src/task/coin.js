const { post } = require("../request");
const { getCsrf } = require("../user");
// 投币
exports.execute = async () => {
  // 视频id 的话，可以基于 up 主来获取随机的 视频 id
  const aid = "801383587";
  const res = await post("https://api.bilibili.com/x/web-interface/coin/add", {
    aid,
    // 投币的数量也可以控制，比如说在完成每日任务的时候，可以基于是否满足了任务来计算出来需要投币多少
    multiply: 1,
    select_like: 0,
    csrf: getCsrf(),
  });

  console.log(res.data);
};
