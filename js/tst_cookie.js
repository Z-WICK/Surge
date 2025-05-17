/**
 * @fileoverview 抓取请求头中的 user-token，并推送到 Telegram（支持参数去重与调试）
 * 塔斯汀哈宝
 */

(async () => {
    const chatId = typeof $argument !== "undefined" ? $argument.match(/chatId=([^&]+)/)?.[1] : null;
    const botToken = typeof $argument !== "undefined" ? $argument.match(/botToken=([^&]+)/)?.[1] : null;
    const DEBUG_MODE = typeof $argument !== "undefined" && $argument.includes("Debug=true");
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // 本地持久化
    let savedData = $persistentStore.read("USER_TOKEN_DATA") || "[]";
    let savedTokens = JSON.parse(savedData); // ["xxx", "yyy"]

    try {
        let userToken = $request.headers['user-token'] || $request.headers['User-Token'];

        if (userToken) {
            if (DEBUG_MODE || !savedTokens.includes(userToken)) {
                // 去重存储
                if (!savedTokens.includes(userToken)) {
                    savedTokens.push(userToken);
                    $persistentStore.write(JSON.stringify(savedTokens), "USER_TOKEN_DATA");
                }

                // 推送到 Telegram
                const message = `user-token: ${userToken}`;
                const pushUrl = `${telegramApiUrl}?chat_id=${chatId}&text=${encodeURIComponent(message)}`;
                console.log(`推送内容: ${message}`);

                $httpClient.get(pushUrl, (err, resp, data) => {
                    if (err) {
                        console.error(`Telegram 推送失败: ${err}`);
                    } else {
                        console.log(`Telegram 推送成功: ${data}`);
                    }
                });
            } else {
                console.log("user-token 未变更，跳过推送");
            }
        } else {
            console.log("未获取到 user-token");
        }
    } catch (e) {
        console.error(`脚本执行异常: ${e}`);
    }

    $done();
})();