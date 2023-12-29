const { Client, GatewayIntentBits } = require('discord.js');
const { config } = require('dotenv');
const express = require('express');

// Load environment variables from .env file
config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Objects to store user balances and cooldowns
const userBalances = {};
const cooldowns = {};

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the HTML page at the root URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // Check if the message content is "!work"
  if (message.content.toLowerCase() === '!work') {
    // Check cooldown
    if (cooldowns[userId] && cooldowns[userId] > Date.now()) {
      const remainingTime = Math.ceil((cooldowns[userId] - Date.now()) / 1000);
      message.reply(`You can work again in ${remainingTime} seconds.`);
    } else {
      // Set cooldown to 1 minute
      cooldowns[userId] = Date.now() + 1 * 60 * 1000;

      // Earn money with a chance of getting injured
      const earnings = Math.floor(Math.random() * 10) + 1;
      const chanceOfInjury = Math.random();

      if (chanceOfInjury < 0.1) {
        // 10% chance of getting injured
        message.reply(`You worked and earned ${earnings} coins, but you got injured!`);
        userBalances[userId] = (userBalances[userId] || 0) + earnings;
      } else {
        // 90% chance of working successfully
        message.reply(`You worked and earned ${earnings} coins.`);
        userBalances[userId] = (userBalances[userId] || 0) + earnings;
      }
    }
  }

  // Check if the message content is "!balance"
  if (message.content.toLowerCase() === '!balance') {
    // Get the user's balance from the object (default to 0 if not set)
    const balance = userBalances[userId] || 0;
    message.reply(`Your balance is ${balance} coins.`);
  }
});

client.login(process.env.DISCORD_TOKEN);
