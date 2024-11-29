/**
 * @fileoverview 抓取 Gacha 请求的 URL 并推送到 Bark
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

    // Bark 推送内容
    const barkPayload = {
        title: "星铁抽卡记录",
        body: `请求 URL: ${url}`,
        group: "星铁记录", // 可选分组，方便管理
    };

    // 发送 Bark 请求
    log("准备向 Bark 发送推送请求...");
    $httpClient.post(
        {
            url: barkUrl,
            body: JSON.stringify(barkPayload),
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