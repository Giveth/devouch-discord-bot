/**
 * Simple health check script for the Discord bot
 * This can be used by monitoring tools to check if the bot is running
 */

// Import required modules
const http = require('http');
const { Client, GatewayIntentBits } = require('discord.js');

// Load environment variables directly since we can't easily import the compiled config
require('dotenv').config();
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// Create a simple HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    // Check if we can connect to Discord
    const client = new Client({
      intents: [GatewayIntentBits.Guilds]
    });

    client.once('ready', () => {
      console.log('Health check: Connected to Discord');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        message: 'Bot is connected to Discord',
        timestamp: new Date().toISOString()
      }));
      client.destroy();
    });

    client.on('error', (error) => {
      console.error('Health check: Failed to connect to Discord', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'unhealthy',
        message: 'Bot failed to connect to Discord',
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    });

    // Attempt to login
    client.login(DISCORD_TOKEN).catch(error => {
      console.error('Health check: Login error', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'unhealthy',
        message: 'Bot failed to login to Discord',
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    });
  } else {
    // For any other route, return 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'error',
      message: 'Not found'
    }));
  }
});

// Start the server on port 8080
const PORT = process.env.HEALTH_CHECK_PORT || 8080;
server.listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});
