# Deovuch Admin Discord Bot

A specialized Discord bot that helps Deovuch administrators identify and verify Giveth projects that have received sufficient vouches from a specific organization on the DeVouch platform.

## Overview

This Discord bot connects to both the DeVouch and Giveth APIs to provide real-time information about projects that have received a configurable minimum number of vouches but have not yet been verified. This tool streamlines the verification workflow for Deovuch administrators by automatically identifying projects that meet the vouch threshold criteria.

## Key Features

- **Vouch Threshold Monitoring**: Identifies Giveth projects that have received a minimum number of vouches from a specific organization
- **Verification Status Checking**: Filters for unverified projects that are active and meet the vouch criteria
- **Formatted Discord Output**: Presents results in a clean, formatted list with direct links to the projects on DeVouch
- **Configurable Parameters**: Customizable threshold, organization ID, and project limit via environment variables

## Admin Commands

### `/vouched-projects [minimum-vouches]`

This slash command retrieves a list of unverified and active Giveth projects that have received at least the specified number of vouches from the configured organization.

**Parameters:**
- `minimum-vouches`: The minimum number of vouches required (integer, minimum value: 1)

**Example Output:**
```
## Unverified & Active Projects with 3+ Vouches

The following projects have received enough vouches but are not yet verified:

- [Project Name 1](https://devouch.xyz/project/giveth/123?organization=0xf63f2a7159ee674aa6fce42196a8bb0605eafcf20c19e91a7eafba8d39fa0404=vouched)
- [Project Name 2](https://devouch.xyz/project/giveth/456?organization=0xf63f2a7159ee674aa6fce42196a8bb0605eafcf20c19e91a7eafba8d39fa0404=vouched)
```

## Configuration for Admins

The bot uses the following environment variables that can be configured by administrators:

| Variable | Description | Default |
|----------|-------------|---------|
| `DEVOUCH_TARGET_ORGANIZATION` | Organization ID to check vouches from | 0xf63f2a7159ee674aa6fce42196a8bb0605eafcf20c19e91a7eafba8d39fa0404 |
| `DEVOUCH_MIN_THRESHOLD` | Minimum number of vouches required | 3 |
| `DEVOUCH_PROJECTS_LIMIT` | Maximum number of projects to check | 150 |
| `GIVETH_PROD_URL` | Giveth GraphQL API endpoint | https://mainnet.serve.giveth.io/graphql |
| `DEVOUCH_PROD_URL` | DeVouch GraphQL API endpoint | https://optimism.backend.devouch.xyz/graphql |

## Technical Details

### API Integration

The bot integrates with two external APIs:

1. **DeVouch API**: Queries for project attestations from a specific organization
   - Endpoint: `https://optimism.backend.devouch.xyz/graphql`
   - Used to find projects with sufficient vouches

2. **Giveth API**: Retrieves detailed project information
   - Endpoint: `https://mainnet.serve.giveth.io/graphql`
   - Used to check verification status and get project details

### Data Flow

1. The bot queries the DeVouch API for project attestations from the configured organization
2. It filters for projects with enough vouches to meet the threshold
3. For each qualifying project, it checks the Giveth API for verification status
4. It collects unverified, active projects and presents them in a formatted list
5. The results are sent as Discord messages with links to the projects

## Admin Setup

### Prerequisites

- Discord server with administrator permissions
- Bot added to your server with appropriate permissions

### Adding the Bot to Your Server

1. Request the bot invite link from the development team
2. Click the link and select your Discord server
3. Ensure the bot has permissions to:
   - Send messages
   - Use slash commands
   - Read message history

## Deployment

### Standard Deployment

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd discord-bot-ts
   ```

2. Install dependencies
   ```bash
   yarn install
   ```

3. Create and configure the `.env` file (see Configuration section)
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. Build and start the bot
   ```bash
   yarn build
   yarn start
   ```

### Docker Deployment

#### Using Docker Compose (Recommended)

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd discord-bot-ts
   ```

2. Create and configure the `.env` file (see Configuration section)
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. Build and start the Docker container
   ```bash
   docker-compose up -d
   ```

4. View logs
   ```bash
   docker-compose logs -f
   ```

5. Stop the container
   ```bash
   docker-compose down
   ```

#### Using the Deployment Script

A convenience script `deploy.sh` is included to simplify Docker operations:

1. Make the script executable (first time only)
   ```bash
   chmod +x deploy.sh
   ```

2. Available commands:
   ```bash
   # Build and start containers
   ./deploy.sh --build
   
   # View logs
   ./deploy.sh --logs
   
   # Restart containers
   ./deploy.sh --restart
   
   # Stop containers
   ./deploy.sh --stop
   
   # Show help
   ./deploy.sh --help
   ```

#### Using Docker Directly

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd discord-bot-ts
   ```

2. Create and configure the `.env` file

3. Build the Docker image
   ```bash
   docker build -t devouch-discord-bot .
   ```

4. Run the Docker container
   ```bash
   docker run -d --name devouch-discord-bot --env-file .env devouch-discord-bot
   ```

## Troubleshooting for Admins

### Common Issues

- **No projects found**: Check if the minimum threshold is set too high or if there are no unverified projects
- **API errors**: Ensure the DeVouch and Giveth APIs are accessible and the endpoints are correctly configured
- **Bot not responding**: Verify the bot is online and has proper permissions in your Discord server

### Docker-specific Issues

- **Container exits immediately**: Check logs with `docker logs devouch-discord-bot` to identify the issue
- **Environment variables not loaded**: Ensure your `.env` file is properly formatted and mounted
- **Health check failing**: The bot includes a health check endpoint at port 8080. You can check the status with `curl http://localhost:8080/health`

### Monitoring

A monitoring script is included to check if the bot is running properly:

1. Make the script executable:
   ```bash
   chmod +x monitor.sh
   ```

2. Run the monitoring script manually:
   ```bash
   ./monitor.sh
   ```

3. Set up a cron job for regular monitoring (example: check every 15 minutes):
   ```bash
   # Open crontab editor
   crontab -e
   
   # Add this line
   */15 * * * * /path/to/discord-bot-ts/monitor.sh >> /path/to/discord-bot-ts/logs/monitor.log 2>&1
   ```

### Support

For additional support or to report issues, please contact the development team.

## License

MIT
