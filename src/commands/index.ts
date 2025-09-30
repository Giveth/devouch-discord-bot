import { REST, Routes } from 'discord.js';
import { CLIENT_ID, DISCORD_TOKEN, GUILD_ID } from '../config';
import { vouchedProjectsCommand } from './vouched-projects';

// Array of commands to register
const commands = [
  vouchedProjectsCommand.data.toJSON(),
];

// Create a new REST instance
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

/**
 * Registers all slash commands with the Discord API
 */
export async function registerCommands(): Promise<void> {
  try {
    console.log('Started refreshing application (/) commands.');
    
    // The path to use depends on whether we're using guild-specific commands or global commands
    const route = GUILD_ID
      ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
      : Routes.applicationCommands(CLIENT_ID);
    
    // Register the commands
    await rest.put(route, { body: commands });
    
    console.log(`Successfully registered ${commands.length} commands ${GUILD_ID ? 'to the test guild' : 'globally'}`);
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Export all commands for use in the interaction handler
export const commandsMap = {
  'vouched-projects': vouchedProjectsCommand,
};
