/**
 * @fileoverview Surge script to log gacha parameters and send them to Bark.
 */

// 动态参数：Bark 推送地址
const barkUrl = "{{{BarkUrl}}}"; // 通过模块动态输入

// 获取完整的 URL
const url = $request.url;

// 使用 URLSearchParams 提取参数
const queryParams = new URLSearchParams(url.split('?')[1]);

// 将参数转为对象
const params = {};
queryParams.forEach((value, key) => {
    params[key] = value;
});

// 将参数转为字符串，供 Bark 使用
const message = `Gacha Log Parameters:\n${JSON.stringify(params, null, 2)}`;

// 发送到 Bark 的消息内容
const barkPayload = {
    title: "Gacha Log Parameters",
    body: message,
    group: "GachaRecord" // 可选，用于分组
};

// 发送 HTTP 请求到 Bark
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

// 响应处理
$done({});