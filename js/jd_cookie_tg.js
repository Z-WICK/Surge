/**
 * @fileoverview 监听京东 Cookie 变更并推送到 Telegram（支持 $argument 参数、finally 保障 $done）
 */

// 从 $argument 中提取参数（Surge 模块传参格式：botToken=xxx&chatId=yyy）
const botToken = typeof $argument !== "undefined" ? $argument.match(/botToken=([^&]+)/)?.[1] : null;
const chatId = typeof $argument !== "undefined" ? $argument.match(/chatId=([^&]+)/)?.[1] : null;

// 参数校验
if (!botToken || !chatId) {
    console.error("❌ 缺少必要的参数 botToken 或 chatId，请在模块设置中配置。");
    $done();
}

const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
const DEBUG_MODE = false; // ✅ 调试模式：跳过去重推送
const STORAGE_KEY = "JD_Cookie_Data";

try {
    let savedData = $persistentStore.read(STORAGE_KEY) || "{}";
    let savedCookies = JSON.parse(savedData);

    const request = $request;
    const headers = request?.headers || {};
    const cookies = headers['Cookie'] || headers['cookie'];

    if (cookies) {
        const pt_key_match = cookies.match(/pt_key=([^;]+)/);
        const pt_pin_match = cookies.match(/pt_pin=([^;]+)/);

        if (pt_key_match && pt_pin_match) {
            const pt_key = pt_key_match[1] + ";";
            const pt_pin = pt_pin_match[1] + ";";

            const message = `pt_key=${pt_key}pt_pin=${pt_pin}`;
            const pushUrl = `${telegramApiUrl}?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

            if (DEBUG_MODE) {
                console.log("⚙️ 调试模式开启，跳过去重判断，直接推送。");
                $httpClient.get(pushUrl, (err, resp, data) => {
                    try {
                        if (err) {
                            console.error(`❌ Telegram 推送失败: ${err}`);
                        } else {
                            console.log(`✅ Telegram 推送成功: ${data}`);
                        }
                    } finally {
                        $done();
                    }
                });
            } else {
                // 非调试模式下执行去重推送逻辑
                if (savedCookies[pt_pin] !== pt_key) {
                    savedCookies[pt_pin] = pt_key;
                    $persistentStore.write(JSON.stringify(savedCookies), STORAGE_KEY);

                    $httpClient.get(pushUrl, (err, resp, data) => {
                        try {
                            if (err) {
                                console.error(`❌ Telegram 推送失败: ${err}`);
                            } else {
                                console.log(`✅ Telegram 推送成功: ${data}`);
                            }
                        } finally {
                            $done();
                        }
                    });
                } else {
                    console.log("ℹ️ Cookie 数据未变，跳过推送。");
                    $done();
                }
            }
        } else {
            console.warn("⚠️ 未找到 pt_key 或 pt_pin，跳过处理。");
            $done();
        }
    } else {
        console.warn("⚠️ 未捕获到 Cookie 请求头。");
        $done();
    }
} catch (e) {
    console.error(`❌ 脚本异常: ${e.message}`);
    $done();
}