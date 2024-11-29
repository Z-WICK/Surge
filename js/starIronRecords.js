/**
 * @fileoverview 抓取 Gacha 参数并推送到 Bark
 */

// 动态获取 Bark 推送地址
const barkUrl = "{{{BarkUrl}}}";

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
    log(`实际使用的 Bark URL: ${barkUrl}`); // 添加日志验证传参
    if (!barkUrl || !barkUrl.startsWith("https://api.day.app/")) {
        log("无效的 Bark 地址，请检查配置！", "ERROR");
        throw new Error("无效的 Bark 地址");
    }

    // 获取完整的 URL
    const url = $request.url;

    // 提取 URL 参数
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const params = {};
    queryParams.forEach((value, key) => {
        params[key] = value;
    });

    // 检查是否有参数
    if (Object.keys(params).length === 0) {
        log("未抓取到任何参数，可能是接口问题。", "WARN");
        throw new Error("未抓取到参数");
    }

    // 格式化参数为 JSON 字符串
    const message = `Gacha Log Parameters:\n${JSON.stringify(params, null, 2)}`;
    log(`成功抓取参数:\n${JSON.stringify(params, null, 2)}`);

    // Bark 推送内容
    const barkPayload = {
        title: "星铁抽卡记录",
        body: message,
        group: "星铁记录", // 可选分组，方便管理
    };

    // 发送 Bark 请求
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
    // 捕获异常并输出日志
    log(`脚本运行异常: ${error.message}`, "ERROR");
} finally {
    // 完成响应处理，防止脚本中断
    $done({});
}