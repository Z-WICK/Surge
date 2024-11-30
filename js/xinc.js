// 变量名: xinxi
// 每天运行一次就行
// 报错是正常情况
// 变量值: api.xinc818.com 请求头中sso的值 多账户&或者换行

// 获取存储的 SSO 数据
let savedSSOs = JSON.parse($persistentStore.read("xinc818_sso_data") || "{}");
let sso = savedSSOs['sso'];  // 从存储中读取 sso

class Task {
    constructor(str) {
        this.index = ++userIdx;
        this.ck = str.split(strSplitor)[0]; // 单账号多变量分隔符
        this.ckStatus = true;
        this.userId = null;
        this.artList = [];
        this.goodsList = [];
    }

    async main() {
        if (!sso) {
            console.log(`❌ 未找到有效的 SSO 数据，无法继续执行任务`);
            return;
        }

        await this.user_info();
        if (this.ckStatus == true) {
            await this.task_signin();
            await this.task_lottery();
            await this.task_share();
            await this.task_goods();
            await this.art_list();
            if (this.artList.length > 0) {
                await this.task_follow(this.artList[0]);
            }
            await this.goods_list();
            if (this.goodsList.length > 0) {
                await this.task_like(this.goodsList[0]);
            }
        }
    }

    async task_signin() {
        try {
            let result = await this.taskRequest("get", `https://api.xinc818.com/mini/sign/in?dailyTaskId=`, { sso });
            if (result.code == 0) {
                $.log(`✅账号[${this.index}]  签到状态【${result.data.flag}】获得积分【${result.data.integral}】🎉`);
            } else {
                console.log(`❌账号[${this.index}]  签到状态【false】`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async user_info() {
        try {
            let result = await this.taskRequest("get", `https://api.xinc818.com/mini/user`, { sso });
            if (result.code == 0) {
                $.log(`✅账号[${this.index}]  【${result.data.nickname}】积分【${result.data.integral}】🎉`);
                this.userId = result.data.id;
            } else {
                console.log(`❌账号[${this.index}]  用户查询【false】`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_goods() {
        try {
            let result = await this.taskRequest("get", `https://api.xinc818.com/mini/dailyTask/browseGoods/22`, { sso });
            if (result.code == 0) {
                if (result.data !== null) {
                    $.log(`✅账号[${this.index}]  完成浏览30s成功 获得【${result.data.singleReward}】`);
                } else {
                    console.log(`❌账号[${this.index}]  完成浏览30s任务失败`);
                }
            } else {
                console.log(`❌账号[${this.index}]  完成浏览30s任务失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_like(id) {
        console.log(`https://api.xinc818.com/mini/integralGoods/${id}?type=`);
        try {
            let goodsResult = await this.taskRequest("get", `https://api.xinc818.com/mini/integralGoods/${id}?type=`, { sso });
            if (goodsResult.data) {
                let likeResult = await this.taskRequest("post", `https://api.xinc818.com/mini/live/likeLiveItem`, { "isLike": true, "dailyTaskId": 20, "productId": Number(goodsResult.data.outerId), sso });
                if (likeResult.code == 0) {
                    if (likeResult.data !== null) {
                        $.log(`✅账号[${this.index}]  完成点击想要任务成功 获得【${likeResult.data.singleReward}】`);
                    } else {
                        console.log(`❌账号[${this.index}]  完成点击想要任务失败`);
                    }
                } else {
                    console.log(`❌账号[${this.index}]  完成点击想要任务失败`);
                    console.log(likeResult);
                }
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_follow(pusherId) {
        console.log(pusherId);
        try {
            let result = await this.taskRequest("post", `https://api.xinc818.com/mini/user/follow`, { "decision": true, "followUserId": pusherId, sso });
            if (result.code == 0) {
                if (result.data !== null) {
                    $.log(`✅账号[${this.index}]  完成关注用户任务成功 获得【${result.data.singleReward}】`);
                } else {
                    console.log(`❌账号[${this.index}]  完成关注用户任务失败`);
                }
            } else {
                console.log(`❌账号[${this.index}]  完成关注用户任务失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_lottery() {
        try {
            let result = await this.taskRequest("post", `https://api.xinc818.com/mini/lottery/draw`, { "activity": 61, "batch": false, "isIntegral": false, "userId": Number(this.userId), "dailyTaskId": 9, sso });
            if (result.code == 0) {
                if (result.data !== null) {
                    $.log(`✅账号[${this.index}]  完成抽奖成功 获得【${result.data.taskResult.singleReward}】积分 奖品【${result.data.lotteryResult.integral}】`);
                } else {
                    console.log(`❌账号[${this.index}]  完成抽奖失败`);
                }
            } else {
                console.log(`❌账号[${this.index}]  完成抽奖失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async task_share() {
        try {
            let result = await this.taskRequest("get", `https://api.xinc818.com/mini/dailyTask/share`, { sso });
            if (result.code == 0) {
                if (result.data !== null) {
                    $.log(`✅账号[${this.index}]  完成分享成功 获得【${result.data.singleReward}】`);
                } else {
                    console.log(`❌账号[${this.index}]  完成分享失败`);
                }
            } else {
                console.log(`❌账号[${this.index}]  完成分享失败`);
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async art_list() {
        try {
            let result = await this.taskRequest("get", `https://cdn-api.xinc818.com/mini/posts/sorts?sortType=COMMENT&pageNum=1&pageSize=10&groupClassId=0`, { sso });
            if (result.code == 0) {
                if (result.data.list.length > 0) {
                    for (let i = 0; i < 2; i++) this.artList.push(result.data.list[i].publisherId);
                }
            } else {
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async goods_list() {
        try {
            let result = await this.taskRequest("get", `https://cdn-api.xinc818.com/mini/integralGoods?orderField=sort&orderScheme=DESC&pageSize=10&pageNum=1`, { sso });
            if (result.code == 0) {
                if (result.data.list.length > 0) {
                    for (let i = 0; i < 2; i++) this.goodsList.push(result.data.list[i].id);
                }
            } else {
                console.log(result);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async taskRequest(method, url, body = {}) {
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${sso}`
        };
        let options = {
            url: url,
            headers: headers
        };
        if (method === 'post') {
            options.body = body;
        }

                return new Promise((resolve, reject) => {
            $.httpRequest(options, (err, resp, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }
}

async function run() {
    let allTasks = [];

    if (sso) {
        let userData = sso.split(envSplitor);  // 多个账户用分隔符分开
        for (let i = 0; i < userData.length; i++) {
            let task = new Task(userData[i]);
            allTasks.push(task.main());
        }

        await Promise.all(allTasks);
    } else {
        $.log("❌ 无效的 SSO 值，无法继续任务执行");
    }

    $done();
}

run();

