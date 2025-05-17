/**
 * @fileoverview 抓取霸王茶姬登录 token 和 userId，并推送到 Telegram（支持参数去重、调试模式）
 */

(async () => {
    const chatId = typeof $argument !== "undefined" ? $argument.match(/chatId=([^&]+)/)?.[1] : null;
    const botToken = typeof $argument !== "undefined" ? $argument.match(/botToken=([^&]+)/)?.[1] : null;
    const DEBUG_MODE = typeof $argument !== "undefined" && $argument.includes("Debug=true");
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    let savedData = $persistentStore.read("BWCJ_CK_Data") || "[]";
    let savedList = JSON.parse(savedData); // 格式: ["token#userId", ...]

    try {
        const body = JSON.parse($response.body || "{}");
        const token = body?.token;
        const userId = body?.user?.id;

        if (token && userId) {
            const composite = `${token}#${userId}`;

            if (DEBUG_MODE || !savedList.includes(composite)) {
                // 保存新记录
                if (!savedList.includes(composite)) {
                    savedList.push(composite);
                    $persistentStore.write(JSON.stringify(savedList), "BWCJ_CK_Data");
                }

                // 发送推送
                const message = `token: ${token}\nuserId: ${userId}`;
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
                console.log("数据未变更，跳过推送。");
            }
        } else {
            console.log("未匹配到 token 或 user.id");
        }
    } catch (e) {
        console.error(`处理失败: ${e}`);
    }

    $done();
})();