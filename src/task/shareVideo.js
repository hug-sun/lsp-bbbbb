const { getCsrf } = require("../user");
const { post, get } = require("../request");
// 分享视频
exports.execute = async () => {
  if (await isShared()) {
    console.log("今日已经分享过视频了");
    return;
  }
  share(await getShareVideoAid());
};

async function share(aid) {
  const res = await post("https://api.bilibili.com/x/web-interface/share/add", {
    aid,
    csrf: getCsrf(),
  });

  if (res.data.code === 0) {
    console.log("每日任务分享视频成功✔");
  } else {
    console.log("每日任务分享视频失败❌");
  }
}

async function isShared() {
  const {
    data: { share_av },
  } = await getDailyTaskInfo();

  return share_av;
}

async function getShareVideoAid() {
  const archives = await getRecommendVideos(5, 1);
  return archives[0].aid;
}

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
