const { getCsrf } = require("../user");
const { post, get } = require("../request");
// 每日观看视频任务
exports.execute = async () => {
  if (await isWatchVideo()) {
    console.log("【模拟观看视频】: " + "今日已经观看过视频❌");
    return;
  }
  const { aid, cid, duration } = await getWatchVideoInfo();
  watchVideo(aid, cid, generateWatchTime(duration));
};

function generateWatchTime(duration) {
  const interval = {
    start: 10,
    end: duration - 2,
  };
  return Math.floor(
    Math.random() * (interval.end - interval.start + 1) + interval.start
  );
}

async function isWatchVideo() {
  const {
    data: { watch_av },
  } = await getDailyTaskInfo();

  return watch_av;
}

async function getWatchVideoInfo() {
  const recommendVideos = await getRecommendVideos(5, 1);
  const { aid, cid, duration } = recommendVideos[0];
  return { aid, cid, duration };
}

async function watchVideo(aid, cid, progres) {
  const result = await post("https://api.bilibili.com/x/v2/history/report", {
    aid,
    cid,
    progres,
    csrf: getCsrf(),
  });
  if (result.data.code === 0) {
    console.log("【模拟观看视频】: 成功✔ ");
  } else {
    console.log("【模拟观看视频】: 失败❌");
  }
}

// TODO
// getDailyTaskInfo 和 getRecommendVideos 已经和 shareVideo 里面的重复了
// 可以抽离出一个获取一个视频的函数来了 （代码的意图就是获取一个随机视频）

async function getDailyTaskInfo() {
  const { data } = await get("https://account.bilibili.com/home/reward");
  return data;
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
