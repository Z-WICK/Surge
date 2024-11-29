/**
 * @fileoverview 抓取 Gacha 参数并推送到 Bark
 */

// 从环境变量中获取 BarkUrl（兼容手动传参）
const barkUrl = typeof $argument !== "undefined" ? $argument.match(/BarkUrl="(.+?)"/)?.[1] : "https://api.day.app/YourBarkKey";

// 日志打印方法
function log(message, level = "INFO") {
    const levels = {
        INFO: "ℹ️ INFO",
        WARN: "⚠️ WARN",
        ERROR: "❌ ERROR",
    };
    console.log(`[${levels[level] || "ℹ️"}] ${message}`);
}

try {
    // 检查 Bark 地址有效性
    log(`实际使用的 Bark URL: ${barkUrl}`);
    if (!barkUrl || barkUrl.includes("{{{") || !barkUrl.startsWith("https://api.day.app/")) {
        log("无效的 Bark 地址，请检查配置！", "ERROR");
        throw new Error("无效的 Bark 地址");
    }

    // 获取完整的 URL
    const url = $request.url;
    log(`完整的请求 URL: ${url}`);

    // 提取 URL 参数
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const params = {};
    queryParams.forEach((value, key) => {
        params[key] = value;
    });

    // 打印解析到的参数内容
    if (Object.keys(params).length === 0) {
        log("未抓取到任何参数，可能是接口问题。", "WARN");
        throw new Error("未抓取到参数");
    } else {
        log(`抓取的参数内容:\n${JSON.stringify(params, null, 2)}`);
    }

    // 格式化参数为 JSON 字符串
    const message = `Gacha Log Parameters:\n${JSON.stringify(params, null, 2)}`;

    // Bark 推送内容
    const barkPayload = {
        title: "星铁抽卡记录",
        body: message,
        group: "星铁记录", // 可选分组，方便管理
    };

    // 发送 Bark 请求
    log("准备向 Bark 发送推送请求...");
    $httpClient.post(
        {
            url: barkUrl,
            body: url,
            headers: { "Content-Type": "application/json" },
        },
        (error, response, data) => {
            if (error) {
                log(`Bark 推送失败: ${error.message}`, "ERROR");
            } else if (response.status !== 200) {
                log(`Bark 推送失败，状态码: ${response.status}`, "ERROR");
            } else {
                log(`Bark 推送成功: ${data}`);
            }
        }
    );
} catch (error) {
    log(`脚本运行异常: ${error.message}`, "ERROR");
} finally {
    $done({});
}