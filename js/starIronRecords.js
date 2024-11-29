/**
 * @fileoverview 抓取 Gacha 参数并推送到 Bark
 */

// 动态获取 Bark 推送地址
const barkUrl = "{{{BarkUrl}}}";

// 获取完整的 URL
const url = $request.url;

// 提取 URL 参数
const queryParams = new URLSearchParams(url.split('?')[1]);

// 转换参数为对象
const params = {};
queryParams.forEach((value, key) => {
    params[key] = value;
});

// 将参数格式化为 JSON 字符串
const message = `Gacha Log Parameters:\n${JSON.stringify(params, null, 2)}`;

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
            console.error("Bark 推送失败:", error);
        } else {
            console.log("Bark 推送成功:", data);
        }
    }
);

// 完成响应处理
$done({});