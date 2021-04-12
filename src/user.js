const biliJct = "5b2d3d54c7c9492abdce5a4fa966a649";
const userData = {
  mid: null, // 用户的 id 吧，基于 mid 可以看看 video 是不是自己的
  money: 0, // 当前用户的硬币数
};

// todo
// 这些数据需要通过外部获取
exports.getCookie = function getCookie() {
  const SESSDATA = "9a846481%2C1631786241%2C59ccf%2A31";
  const DedeUserID = "175301983";
  return `bili_jct=${biliJct};SESSDATA=${SESSDATA};DedeUserID=${DedeUserID};`;
};

exports.getCsrf = () => {
  return biliJct;
};

exports.initUserData = async function updateMoney() {
  const { get } = require("./request");
  const {
    data: { data: userInfo },
  } = await get("https://api.bilibili.com/x/web-interface/nav");
  userData.money = userInfo.money;
  userData.mid = userInfo.mid;
};

exports.updateMoney = async function updateMoney() {
  const { get } = require("./request");
  const {
    data: {
      data: { money: coinCount },
    },
  } = await get("https://api.bilibili.com/x/web-interface/nav");
  userData.money = coinCount;
};

exports.isSelfVideo = (mid) => {
  return userData.mid === mid;
};


exports.getMid = () => {
  return userData.mid
  
}

exports.getMoney = () => {
  return userData.money;
};
