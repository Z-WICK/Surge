/**
 * @fileoverview 监听京东 Cookie 变更并推送到 Telegram（支持 $argument 参数、finally 保障 $done）
 */

// 从 $argument 中提取参数（Surge 模块传参格式：botToken=xxx&chatId=yyy）

(async () => {
    const chatId = typeof $argument !== "undefined" ? $argument.match(/chatId=([^&]+)/)?.[1] : null;
    const botToken = typeof $argument !== "undefined" ? $argument.match(/botToken=([^&]+)/)?.[1] : null;
    let telegramApiUrl = 'https://api.telegram.org/bot' + botToken + '/sendMessage'; // 替换为你的 Telegram Bot API Token

    // 调试模式开关
    // const DEBUG_MODE = typeof $argument !== "undefined" && $argument.includes("Debug=true"); // 如果为 true，将跳过去重检查，直接发送推送
    const DEBUG_MODE = true;


    // 本地存储，用于记录已抓取的数据
    let savedData = $persistentStore.read("JD_Cookie_Data") || "{}";
    let savedCookies = JSON.parse(savedData);

    let request = $request;
    let headers = request.headers;
    let cookies = headers['Cookie'] || headers['cookie']; // 获取请求中的 Cookie

    if (cookies) {
        // 匹配 pt_key 和 pt_pin
        let pt_key_match = cookies.match(/pt_key=([^;]+)/); // 正确的正则表达式
        let pt_pin_match = cookies.match(/pt_pin=([^;]+)/); // 修正后的正则表达式

        if (pt_key_match && pt_pin_match) {
            let pt_key = pt_key_match[1] + ";"; // 加上分号
            let pt_pin = pt_pin_match[1] + ";"; // 加上分号

            // 如果开启调试模式，直接发送推送，不做去重检查
            if (DEBUG_MODE) {
                console.log("调试模式开启，跳过去重检查，直接发送推送。");

                // 生成推送内容
                let message = `pt_key=${pt_key}pt_pin=${pt_pin}`;
                console.log(message);

                // 发送到 Telegram
                let pushUrl = `${telegramApiUrl}?chat_id=${chatId}&text=${encodeURIComponent(message)}`;
                $httpClient.get(pushUrl, (err, resp, data) => {
                    if (err) {
                        console.error(`Telegram 推送失败: ${err}`);
                    } else {
                        console.log(`Telegram 推送成功: ${data}`);
                    }
                });
            } else {
                // 判断是否是新数据
                if (savedCookies[pt_pin] !== pt_key) {
                    // 保存新的数据
                    savedCookies[pt_pin] = pt_key;
                    $persistentStore.write(JSON.stringify(savedCookies), "JD_Cookie_Data");

                    // 生成推送内容
                    let message = `pt_key=${pt_key}pt_pin=${pt_pin}`;
                    console.log(message);

                    // 发送到 Telegram
                    let pushUrl = `${telegramApiUrl}?chat_id=${chatId}&text=${encodeURIComponent(message)}`;
                    $httpClient.get(pushUrl, (err, resp, data) => {
                        if (err) {
                            console.error(`Telegram 推送失败: ${err}`);
                        } else {
                            console.log(`Telegram 推送成功: ${data}`);
                        }
                    });
                } else {
                    console.log("数据未变化，跳过推送。");
                }
            }
        }
    }

    $done();
})();
