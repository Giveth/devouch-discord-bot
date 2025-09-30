import { Client, Events, GatewayIntentBits } from 'discord.js';
import { DISCORD_TOKEN } from './config';
import { commandsMap, registerCommands } from './commands';

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  const { commandName } = interaction;
  
  // Check if the command exists in our commands map
  if (!(commandName in commandsMap)) {
    console.error(`Command not found: ${commandName}`);
    return;
  }
  
  try {
    // Execute the command
    await commandsMap[commandName as keyof typeof commandsMap].execute(interaction);
  } catch (error) {
    console.error(`Error executing ${commandName} command:`, error);
    
    // Reply to the user with an error message
    const content = 'There was an error while executing this command!';
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content, ephemeral: true });
    } else {
      await interaction.reply({ content, ephemeral: true });
    }
  }
});

// Register slash commands with Discord API
(async () => {
  try {
    await registerCommands();
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();

// Log in to Discord with your client's token
client.login(DISCORD_TOKEN)
  .catch(error => {
    console.error('Error logging in to Discord:', error);
    process.exit(1);
  });
