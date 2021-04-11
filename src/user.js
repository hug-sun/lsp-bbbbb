const biliJct = "5b2d3d54c7c9492abdce5a4fa966a649";
let money; // 当前用户的硬币数

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

exports.updateMoney = async function updateMoney() {
  const { get } = require("./request");
  const {
    data: {
      data: { money:coinCount },
    },
  } = await get("https://api.bilibili.com/x/web-interface/nav");
  money = coinCount
};

exports.getMoney = () => {
  return money;
};
