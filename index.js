const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const fs = require("fs");

const PREFIX = "h!";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


// データ読み込み
function load(file, def = {}) {
    if (!fs.existsSync(`./data/${file}`)) {
        return def;
    }

    return JSON.parse(
        fs.readFileSync(`./data/${file}`, "utf8")
    );
}


// データ保存
function save(file, data) {
    fs.writeFileSync(
        `./data/${file}`,
        JSON.stringify(data, null, 2)
    );
}


let users = load("users.json", {});
let companies = load("companies.json", {});
let logs = load("logs.json", []);



client.once("ready", () => {
    console.log(
        `${client.user.tag} 起動完了`
    );
});



client.on("messageCreate", async message => {

    if (message.author.bot) return;

    if (!message.content.startsWith(PREFIX)) return;


    const args =
        message.content
        .slice(PREFIX.length)
        .trim()
        .split(/ +/);


    const cmd = args.shift();

    const id = message.author.id;



    // 初期ユーザー作成
    if (!users[id]) {
        users[id] = {
            money: 10000,
            bank: 0,
            debt: 0,
            chips: 0,
            lastLogin: 0
        };

        save("users.json", users);
    }



    // ヘルプ
    if (cmd === "help") {

        return message.reply(
`🏦 中央銀行Bot

基本
h!login
h!user
h!top
h!economy

銀行
h!dep <金額>
h!wd <金額>
h!pay @user <金額>

会社
h!会社設立
h!会社

カジノ
h!slots <金額>`
        );
    }



    // ログイン
    if (cmd === "login") {

        const now = Date.now();

        if(now - users[id].lastLogin < 86400000){
            return message.reply(
                "今日はもう受け取り済みです"
            );
        }


        users[id].money += 1000;
        users[id].lastLogin = now;

        save("users.json", users);


        return message.reply(
            "🎁 ログインボーナス 1000コイン"
        );
    }



    // ユーザー情報
    if(cmd === "user"){

        return message.reply(
`💰 所持金: ${users[id].money}
🏦 口座: ${users[id].bank}
📉 借金: ${users[id].debt}`
        );

    }



    // 預金
    if(cmd === "dep"){

        const amount =
        args[0] === "all"
        ? users[id].money
        : Number(args[0]);


        if(!amount || amount <= 0)
            return message.reply("金額を入力してください");


        if(users[id].money < amount)
            return message.reply("お金不足");


        users[id].money -= amount;
        users[id].bank += amount;


        save("users.json",users);


        return message.reply(
            `🏦 ${amount}コイン預けました`
        );
    }



    // 引き出し
    if(cmd === "wd"){

        const amount =
        args[0] === "all"
        ? users[id].bank
        : Number(args[0]);


        if(users[id].bank < amount)
            return message.reply("口座残高不足");


        users[id].bank -= amount;
        users[id].money += amount;


        save("users.json",users);


        return message.reply(
            `💰 ${amount}コイン引き出しました`
        );
    }



    // 経済情報
    if(cmd === "economy"){

        let total = 0;

        Object.values(users)
        .forEach(u=>{
            total += u.money + u.bank;
        });


        return message.reply(
            `🌎 流通量: ${total}`
        );
    }


});



client.login(
    process.env.DISCORD_TOKEN
);
