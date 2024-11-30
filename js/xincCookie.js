(async () => {
    // 获取 Bark URL 和调试模式参数
    const barkUrl = typeof $argument !== "undefined"
        ? $argument.match(/BarkUrl="(.+?)"/)?.[1]
        : null;

    const debugMode = typeof $argument !== "undefined" && $argument.includes("Debug=true");

    // 如果 Bark URL 未定义，输出错误日志，但依然抓取 sso 数据
    if (!barkUrl) {
        console.error("Bark URL 未定义，跳过推送操作。");
    }

    // 本地存储，用于记录已抓取的 `sso` 数据
    let savedData = $persistentStore.read("xinc818_sso_data") || "{}";
    let savedSSOs = JSON.parse(savedData);

    let request = $request;
    let headers = request.headers;

    // 从请求 Header 中提取 `sso`
    let sso = headers['sso']; // 获取 Header 中的 `sso`
    if (sso) {
        // 如果是调试模式，跳过 `sso` 重复检查
        if (debugMode) {
            console.log("调试模式开启：每次都抓取新的 sso 数据。");
        } else {
            // 判断是否是新数据，只有在非调试模式下检查重复
            if (savedSSOs['sso'] === sso) {
                console.log("sso 数据重复，跳过抓取。");
                $done();  // 数据重复，直接结束脚本
                return;
            }
        }

        // 保存新的数据
        savedSSOs['sso'] = sso;
        $persistentStore.write(JSON.stringify(savedSSOs), "xinc818_sso_data");

        // 生成日志内容
        let message = `抓取成功！\nsso=${sso}`;
        console.log(message);

        // 只有在 Bark URL 已定义时才发送推送
        if (barkUrl) {
            let pushUrl = `${barkUrl}/${encodeURIComponent('xinc818 SSO 抓取')}/${encodeURIComponent(message)}`;
            $httpClient.get(pushUrl, (err, resp, data) => {
                if (err) {
                    console.error(`Bark 推送失败: ${err}`);
                    console.error("请检查 Bark URL 是否正确或网络连接是否正常。");
                } else {
                    console.log(`Bark 推送成功: ${data}`);
                }
            });
        }
    } else {
        console.log("未在 Header 中找到 sso 参数");
    }

    $done();
})();
