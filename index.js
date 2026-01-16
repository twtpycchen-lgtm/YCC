export default {
  async fetch(request, env) {
    // 使用 ASSETS binding 來 serve 靜態檔
    return env.ASSETS.fetch(request);
  }
};
