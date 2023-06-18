const { Client, Intents } = require('discord.js');
const { Client: NotionClient, APIErrorCode } = require('@notionhq/client');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}


// Initialize Discord bot
const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Initialize Notion client
const notionClient = new NotionClient({ auth: process.env.NOTION_SECRET });

const notionDatabaseId = process.env.NOTION_DATABASE_ID;

// Event for when the bot is ready
discordClient.once('ready', () => {
  console.log('Discord bot is ready!');
});

// Event for when a message is sent in Discord
discordClient.on('messageCreate', async (message) => {
  // Ignore messages from the bot itself
  if (message.author.bot) {
    return;
  }

  // Add a new entry to the Notion database with the message content
  try {
    await notionClient.pages.create({
      parent: { database_id: notionDatabaseId },
      properties: {
        Name: { // Assuming the database has a 'Name' property
          title: [
            {
              type: 'text',
              text: { content: message.content },
            },
          ],
        },
        Channel: { // Assuming the database has a 'Channel' property
          type: 'text',
          text: { content: message.channel.name },
        },
        // Add other properties here
      },
    });
    console.log('Entry added to Notion database!');
  } catch (error) {
    if (error.code === APIErrorCode.ObjectNotFound) {
      console.error('The Notion database was not found');
    } else {
      console.error('An error occurred:', error);
    }
  }
});

// Start the Discord bot
discordClient.login('your_discord_bot_token');
