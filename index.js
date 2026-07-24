const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const config = require("./config.json");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log(`${client.user.tag} 起動しました`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content
        .slice(config.prefix.length)
        .trim()
        .split(/ +/);

    const command = args.shift();


    if (command === "help") {
        return message.reply(
            "🏦 中央銀行Bot\n\n" +
            "h!user\n" +
            "h!dep\n" +
            "h!wd\n" +
            "h!pay\n" +
            "h!economy"
        );
    }


    if (command === "ping") {
        return message.reply("🟢 稼働中");
    }
});


client.login(process.env.DISCORD_TOKEN);
