const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const axios = require("axios");
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const API = "https://yoacoin-api.keitodaze.net/api/v1";

let cursor = 0;

client.once("ready", () => {
    console.log(`${client.user.tag} 起動完了`);
});

client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith("h!")) return;

    const args = message.content.slice(2).trim().split(" ");
    const command = args.shift();

    const headers = {
        Authorization: `Bearer ${process.env.YOACOIN_API_KEY}`
    };

    try {

        // ヘルプ
        if (command === "help") {
            const embed = new EmbedBuilder()
                .setTitle("Botコマンド")
                .setDescription(
                    "`h!company` 自社情報\n" +
                    "`h!payments` 入金確認\n" +
                    "`h!ping` 稼働確認"
                );

            return message.reply({ embeds: [embed] });
        }


        // 起動確認
        if (command === "ping") {
            return message.reply("🟢 稼働中");
        }


        // 会社情報
        if (command === "company") {

            const res = await axios.get(
                `${API}/company`,
                { headers }
            );

            return message.reply({
                content:
                "🏢 会社情報\n```json\n" +
                JSON.stringify(res.data, null, 2) +
                "\n```"
            });
        }


        // 入金確認
        if (command === "payments") {

            const res = await axios.get(
                `${API}/payments`,
                {
                    params:{
                        since: cursor,
                        limit:50
                    },
                    headers
                }
            );

            const data = res.data;

            if(data.count === 0){
                return message.reply("📭 新しい入金はありません");
            }

            cursor = data.next_cursor;

            let text = "💰 入金一覧\n";

            data.payments.forEach(p=>{
                text +=
                `\n👤 ${p.user_id}\n💵 ${p.amount}コイン`;
            });

            return message.reply(text);
        }

    } catch(error){

        console.error(error.response?.data || error);

        message.reply(
            "❌ APIエラーが発生しました"
        );
    }
});


client.login(process.env.DISCORD_TOKEN);
