const { post, get } = require("../request");
const {
  getCsrf,
  updateMoney,
  getMoney,
  isSelfVideo,
  getMid,
} = require("../user");
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
  if (!isCoin(coinInfo)) {
    console.log("【投币】: 当前无需执行投币操作❌");
  }
  // 2. 可以投币的视频
  const videos = await getCoinVideos();

  // 进行投币
  const length = coinInfo.actualCoinCount;
  for (let i = 0; i < length; i++) {
    const { aid } = videos[i];

    const res = await post(
      "https://api.bilibili.com/x/web-interface/coin/add",
      {
        aid,
        // 投币的数量也可以控制，比如说在完成每日任务的时候，可以基于是否满足了任务来计算出来需要投币多少
        multiply: 1,
        select_like: 0,
        csrf: getCsrf(),
      }
    );

    console.log(res.data);
  }

  // 3. 进行投币
};

/**
 * 获取可投币的视频
 */
async function getCoinVideos() {
  // TODO
  // 可优化点
  // 1. 获取视频的数量只要满足 需要投币的视频数即可 - 所以获取视频的时候可以看看是不是已经满足要求了，如果满足了就不需要在继续执行下面的获取视频逻辑了
  // 2. 去获取视频的时候用得是串行的请求方式，可以替换成 并行的请求方式 Promise.all

  // 1. 优先投币的 up 主
  const uId = 476704454;
  const upVideos = await getVideosByUid(uId);

  // 2. 获取当前用户的最新动态的视频列表
  const videos = await dynamicNew();

  // 3. 大区里面去找视频
  const recommendVideos = await getRecommendVideos(5, 1);

  return [...upVideos, ...videos, ...recommendVideos];
}

// 获取b 站推荐的视频
// pageSize 为想要获取的视频数量
// rId 是具体分区的 id -> TODO 可以后面用常量来表示分区 id
async function getRecommendVideos(pageSize, rid) {
  const res = await get(
    "https://api.bilibili.com/x/web-interface/dynamic/region",
    { ps: pageSize, rid }
  );

  return res.data.data.archives;
}

async function dynamicNew() {
  const {
    data: {
      data: { cards },
    },
  } = await get(
    "https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new",
    {
      uid: getMid(),
      type_list: 8,
    }
  );

  return cards ? cards : [];
}

// private List<String> dynamicNew(int num){
//   JSONObject pJson = new JSONObject();
//   pJson.put("uid", USER_DATA.getMid());
//   pJson.put("type_list", 8);
//   JSONObject dynamic = Request.get("https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/dynamic_new", pJson);
//   List<String> videoAid = new ArrayList<>();
//   String success = "0";
//   String key = "code";
//   if(success.equals(dynamic.getString(key))){
//       JSONArray cards = dynamic.getJSONObject("data").getJSONArray("cards");
//       // 没有任何动态，则不会有 cards 数组
//       if(cards==null){
//           return new ArrayList<>();
//       }
//       for(Object object : cards){
//           JSONObject card = (JSONObject) object;
//           String aid = card.getJSONObject("desc").getString("rid");
//           String mid = card.getJSONObject("desc").getString("uid");
//           if (isThrowCoins(aid, mid)) {
//               videoAid.add(aid);
//           }
//           if(videoAid.size()>=num){
//               break;
//           }
//       }
//   }
//   return videoAid;
// }

/**
 * 判断该视频是否已经投币过
 * @aid 视频 aid
 */
async function isNoCoinVideo(aid) {
  const {
    data: {
      data: { multiply },
    },
  } = await get("https://api.bilibili.com/x/web-interface/archive/coins", {
    aid,
  });

  return multiply === 0;

  // o        JSONObject pJson = new JSONObject();
  // pJson.put("aid", aid);
  // JSONObject object = Request.get("https://api.bilibili.com/x/web-interface/archive/coins", pJson);
  // int multiply = object.getJSONObject("data").getIntValue("multiply");
  // return multiply == 0;
}

/**
 * 获取当前 up 主的最新的 30 条视频
 */
async function getVideosByUid(uId) {
  const {
    data: {
      data: { list },
    },
  } = await get("https://api.bilibili.com/x/space/arc/search", {
    mid: uId,
  });

  return list.vlist;
}

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
