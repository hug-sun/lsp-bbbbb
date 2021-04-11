const { post, get } = require("../request");
const { getCsrf, updateMoney, getMoney } = require("../user");
const { getCoin } = require("../config");

// 投币
exports.execute = async () => {
  // 视频id 的话，可以基于 up 主来获取随机的 视频 id
  // const aid = "801383587";
  // const res = await post("https://api.bilibili.com/x/web-interface/coin/add", {
  //   aid,
  //   // 投币的数量也可以控制，比如说在完成每日任务的时候，可以基于是否满足了任务来计算出来需要投币多少
  //   multiply: 1,
  //   select_like: 0,
  //   csrf: getCsrf(),
  // });
  // console.log(res.data);
  // 1. 今日需要投币的数量(投)
  const coinInfo = await getCoinInfo();
  logCoin(coinInfo);
  if(!isCoin(coinInfo)){
    console.log("【投币】: 当前无需执行投币操作❌");
  }
  // 2. 可以投币的视频
  // 3. 进行投币
};

/**
 * 计算出投币的数据
 *   
 * @returns 
 * @customCount 用户自定义的投币数量
 * @alreadyCount 用户已经投币的数量
 * @needCoinCount 用户需要投币的数量
 * @actualCoinCount 用户实际投币的数量（有可能用户的币没有那么多，所以会导致实际投币的数量币需要投币的数量少）
 */
async function getCoinInfo() {
  const coinExperienceValue = await getCoinExperienceValue();

  await updateMoney();

  let needCoinCount = Math.max((getCoin() * 10 - coinExperienceValue) / 10, 0);
  // /* 实际需要投 num个硬币 */
  let actualCoinCount = Math.min(
    getCoin(),
    Math.min(needCoinCount, getMoney())
  );

  return {
    customCount: getCoin(),
    alreadyCount: coinExperienceValue / 10,
    needCoinCount,
    actualCoinCount,
  };
}

/**
 * 是否还需要继续投币
 */
function isCoin({ actualCoinCount }) {
  return actualCoinCount > 0;
}

function logCoin({
  customCount,
  alreadyCount,
  needCoinCount,
  actualCoinCount,
}) {
  console.log(
    "【投币计算】: 自定义投币数: " +
      customCount +
      " ,今日已投币: " +
      alreadyCount +
      " ,还需投币: " +
      needCoinCount +
      " ,实际投币: " +
      actualCoinCount
  );
}

/**
 * 获取当日投币已经获取到的经验值
 */
async function getCoinExperienceValue() {
  const {
    data: { coins_av },
  } = await getDailyTaskInfo();
  return coins_av;
}

// TODO
// getDailyTaskInfo 和 getRecommendVideos 已经和 shareVideo 里面的重复了
// 可以抽离出一个获取一个视频的函数来了 （代码的意图就是获取一个随机视频）
async function getDailyTaskInfo() {
  const { data } = await get("https://account.bilibili.com/home/reward");
  return data;
}
