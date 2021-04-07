const axios = require("axios");
const { getCookie } = require("./user");
function getCommonHeaders() {
  return {
    connection: "keep-alive",
    referer: "https://www.bilibili.com/",
    // "User-Agent": "",
    Cookie: getCookie(),
  };
}

exports.get = function get(url, params) {
  return axios({
    url,
    method: "get",
    headers: {
      ...getCommonHeaders(),
    },
    params,
  });
};

exports.post = function post(url, params) {
  return axios({
    url,
    method: "post",
    headers: {
      ...getCommonHeaders(),
      accept: "application/json, text/plain, */*",
      "Content-Type": "application/x-www-form-urlencoded",
      charset: "UTF-8",
    },
    params,
  });
};

//////////////////////////// test ///////////////

// todo ,后面需要把这个逻辑移动到测试脚本内去
// 测试 get 请求
//   const res = await get(
//     "https://api.bilibili.com/x/web-interface/archive/coins",
//     {
//       aid,
//     }
//   );

// 测试 post 请求
//   const res = await post(
//     //给视频点赞/取消点赞
//     "https://api.bilibili.com/x/web-interface/archive/like",
//     {
//       aid,
//       csrf,
//       like: 1,
//     }
//   );
