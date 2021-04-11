// 可以自行配置
// config 这个可以基于外部读取的形式导入
const config = {
  coin: 5, // 每日投币的数量(基于等级的不同，这个每日可投币的数量也是不同的)
};

module.exports = {
  getCoin() {
    return Math.max(config.coin, 0) || 0;
  },
};
