/**
 * @fileoverview 抓取请求中的 cookie token 并推送到 Telegram（支持去重 + 调试 + 持久化）
 * 作者：Sion & ChatGPT
 */

(async () => {
    const chatId = typeof $argument !== "undefined" ? $argument.match(/chatId=([^&]+)/)?.[1] : null;
    const botToken = typeof $argument !== "undefined" ? $argument.match(/botToken=([^&]+)/)?.[1] : null;
    const DEBUG_MODE = typeof $argument !== "undefined" && $argument.includes("Debug=true");

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    let savedData = $persistentStore.read("MT_COOKIE_TOKENS") || "[]";
    let savedTokens = JSON.parse(savedData); // ["token1", "token2"]

    try {
        const cookieHeader = $request.headers['Cookie'] || $request.headers['cookie'];
        const tokenMatch = cookieHeader?.match(/(?:^|;)\s*token=([^;]+)/);

        if (tokenMatch) {
            const token = tokenMatch[1];

            if (DEBUG_MODE || !savedTokens.includes(token)) {
                if (!savedTokens.includes(token)) {
                    savedTokens.push(token);
                    $persistentStore.write(JSON.stringify(savedTokens), "MT_COOKIE_TOKENS");
                }

                const message = `🍪 Cookie token:\n\n${token}`;
                const pushUrl = `${telegramApiUrl}?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

                console.log(`📤 推送中: ${message}`);
                $httpClient.get(pushUrl, (err, resp, data) => {
                    if (err) {
                        console.error(`❌ Telegram 推送失败: ${err}`);
                    } else {
                        console.log(`✅ Telegram 推送成功: ${data}`);
                    }
                });
            } else {
                console.log("🔁 Token 未变更，跳过推送");
            }
        } else {
            console.log("⚠️ 未在 Cookie 中找到 token");
        }
    } catch (e) {
        console.error(`❗ 脚本执行异常: ${e}`);
    }

    $done();
})();