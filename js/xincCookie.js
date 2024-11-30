(async () => {
    const barkUrl = typeof $argument !== "undefined" ? $argument.match(/BarkUrl="(.+?)"/)?.[1] : "https://api.day.app/YourBarkKey";

    // 本地存储，用于记录已抓取的 `sso` 数据
    let savedData = $persistentStore.read("xinc818_sso_data") || "{}";
    let savedSSOs = JSON.parse(savedData);

    let request = $request;
    let headers = request.headers;

    // 从请求 Header 中提取 `sso`
    let sso = headers['sso']; // 获取 Header 中的 `sso`
    if (sso) {
        // 判断是否是新数据
        if (savedSSOs['sso'] !== sso) {
            // 保存新的数据
            savedSSOs['sso'] = sso;
            $persistentStore.write(JSON.stringify(savedSSOs), "xinc818_sso_data");

            // 生成推送内容
            let message = `抓取成功！\nsso=${sso}`;
            console.log(message);

            // 发送 Bark 推送
            let pushUrl = `${barkUrl}/${encodeURIComponent('xinc818 SSO 抓取')}/${encodeURIComponent(message)}`;
            $httpClient.get(pushUrl, (err, resp, data) => {
                if (err) {
                    console.error(`Bark 推送失败: ${err}`);
                } else {
                    console.log(`Bark 推送成功: ${data}`);
                }
            });
        } else {
            console.log("数据未变化，跳过推送。");
        }
    } else {
        console.log("未在 Header 中找到 sso 参数");
    }

    $done();
})();