/**
 * @fileoverview 抓取请求体中的 token，并推送到 Telegram（支持参数去重与调试）
 * @author Sion
 */

(async () => {
    const chatId = typeof $argument !== "undefined" ? $argument.match(/chatId=([^&]+)/)?.[1] : null;
    const botToken = typeof $argument !== "undefined" ? $argument.match(/botToken=([^&]+)/)?.[1] : null;
    const DEBUG_MODE = typeof $argument !== "undefined" && $argument.includes("Debug=true");
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    // 本地持久化
    let savedData = $persistentStore.read("TTE_TOKEN_DATA") || "[]";
    let savedTokens = JSON.parse(savedData); // ["xxx", "yyy"]

    try {
        const body = $request.body;
        let token = null;

        try {
            const json = JSON.parse(body);
            token = json?.token;
        } catch (e) {
            console.log("请求体不是 JSON 格式，尝试正则匹配 token");
            token = body?.match(/"token"\s*:\s*"([^"]+)"/)?.[1];
        }

        if (token) {
            if (DEBUG_MODE || !savedTokens.includes(token)) {
                if (!savedTokens.includes(token)) {
                    savedTokens.push(token);
                    $persistentStore.write(JSON.stringify(savedTokens), "TTE_TOKEN_DATA");
                }

                const message = `抓取 token 成功：${token}`;
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
                console.log("token 未变更，跳过推送");
            }
        } else {
            console.log("未获取到 token");
        }
    } catch (e) {
        console.error(`脚本执行异常: ${e}`);
    }

    $done();
})();