Discord URL Shortener Bot

A powerful Discord bot that integrates with a custom URL shortener API, allowing users to create shortened URLs directly from Discord with slash commands.

Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Commands](#-commands)
- [API Integration](#-api-integration)
- [Architecture](#-architecture)
- [Error Handling](#-error-handling)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

Features

- 🔗 **URL Shortening**: Create shortened URLs directly from Discord
- 🎨 **Custom Short Codes**: Optional custom aliases for your URLs
- 📊 **Analytics**: Track click counts and usage statistics
- 🛡️ **Input Validation**: Comprehensive URL and custom code validation
- 🔐 **User Management**: Automatic Discord user creation and linking
- 📱 **Rich Embeds**: Beautiful, informative response messages
- ⚡ **Slash Commands**: Modern Discord interaction system
- 🌐 **API Integration**: Seamless connection with URL shortener backend

Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A Discord application and bot token
- Running URL shortener API (see main project)

Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/discord-url-shortener-bot.git
   cd discord-url-shortener-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_application_client_id

# API Configuration
API_BASE_URL=http://localhost:8001
API_TIMEOUT=10000

# Optional: Logging
LOG_LEVEL=info
```

### Discord Developer Portal Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section
4. Create a bot and copy the token
5. Enable the following bot permissions:
   - `Send Messages`
   - `Use Slash Commands`
   - `Embed Links`
   - `Read Message History`

### Bot Invitation

Use this URL template to invite your bot:
```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2147483648&scope=bot%20applications.commands
```

Replace `YOUR_CLIENT_ID` with your actual Discord application client ID.

Usage

### Starting the Bot

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### Bot Status Indicators

- ✅ **Online**: Bot is running and API is accessible
- ⚠️ **Degraded**: Bot is running but API connection issues
- ❌ **Offline**: Bot is not running

Commands

### `/shortenurl`

Create a shortened URL from any valid web address.

**Parameters:**
- `url` (required): The URL you want to shorten
- `custom` (optional): Custom short code (3-20 characters)

**Examples:**
```
/shortenurl url:https://www.google.com
/shortenurl url:https://github.com/yourusername custom:github-profile
```

**Response Format:**
```
✅ URL Shortened!
Original: https://www.google.com
Shortened: http://localhost:8001/url/abc12345
Via: Your Localhost API
Total Clicks: 0
```

### Input Validation Rules

#### URL Requirements:
- Must be a valid URL format
- Must include protocol (http:// or https://)
- Must be accessible and well-formed

#### Custom Code Requirements:
- 3-20 characters long
- Only letters, numbers, hyphens, and underscores
- Must be unique across the system
- Case-sensitive

## 🔗 API Integration

The bot communicates with a RESTful API backend:

### Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/discord/shorten` | Create shortened URL |
| `GET` | `/api/discord/user/:id/urls` | Get user's URLs |
| `DELETE` | `/api/discord/url/:shortId` | Delete URL |
| `GET` | `/health` | Check API status |

### Request/Response Examples

**Shorten URL Request:**
```json
{
  "url": "https://www.example.com",
  "discordUserId": "123456789012345678",
  "custom": "my-link"
}
```

**Successful Response:**
```json
{
  "shortId": "abc12345",
  "shortUrl": "http://localhost:8001/url/abc12345",
  "redirectUrl": "https://www.example.com",
  "totalClicks": 0,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "discordUserId": "123456789012345678"
}
```

Architecture

### Project Structure

```
discord-bot/
├── src/
│   ├── commands/           # Slash command definitions
│   ├── handlers/           # Event handlers
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── config/             # Configuration files
├── tests/                  # Test files
├── docs/                   # Documentation
├── .env.example            # Environment template
├── bot.js                  # Main bot file
├── package.json            # Dependencies
└── README.md              # This file
```

### Key Components

#### LocalURLShortener Class
```javascript
class LocalURLShortener {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async shortenURL(originalURL, discordUserId, code = null) {
        // API communication logic
    }
}
```

#### Command Handler
- Processes slash commands
- Validates input parameters
- Formats response embeds
- Handles errors gracefully

#### User Management
- Automatic Discord user account creation
- Links Discord IDs to backend user system
- Maintains user session consistency

Error Handling

The bot implements comprehensive error handling:

### Validation Errors
- **Invalid URL**: "Please provide a valid URL starting with http:// or https://"
- **Custom Code Taken**: "That custom short code is already in use"
- **Invalid Characters**: "Custom codes can only contain letters, numbers, hyphens, and underscores"

### API Errors
- **Connection Failed**: "Can't connect to URL shortener service"
- **Rate Limited**: "Too many requests, please try again later"
- **Server Error**: "Something went wrong on our end"

### User-Friendly Messages
```javascript
// Example error response
const embed = {
    color: 0xff0000,
    title: '❌ Error',
    description: 'Please check your URL format and try again.',
    fields: [
        { name: '💡 Tips', value: '• URLs must start with http:// or https://\n• Make sure the URL is complete' }
    ]
};
```

Development

### Setting Up Development Environment

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run in development mode**
   ```bash
   npm run dev
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Lint code**
   ```bash
   npm run lint
   ```

### Adding New Commands

1. Create command definition in `src/commands/`
2. Register command in `commands` array
3. Add handler in `interactionCreate` event
4. Update this README

### Environment Setup for Testing

```bash
# Copy environment template
cp .env.example .env.test

# Set test-specific variables
API_BASE_URL=http://localhost:3001
DISCORD_TOKEN=test_token_here
```

Troubleshooting

### Common Issues

#### Bot Not Responding
```bash
# Check bot status
npm run status

# Verify token
echo $DISCORD_TOKEN

# Check permissions
# Ensure bot has 'Use Slash Commands' permission
```

#### API Connection Issues
```bash
# Test API connectivity
curl http://localhost:8001/health

# Check API logs
tail -f api.log
```

#### Commands Not Appearing
```bash
# Force refresh slash commands
npm run refresh-commands

# Check bot permissions in Discord server
```

### Debug Mode

Enable detailed logging:
```env
LOG_LEVEL=debug
DEBUG=discord-bot:*
```

### Health Checks

The bot includes built-in health monitoring:
- API connectivity checks
- Command registration status
- Error rate monitoring

Monitoring

### Metrics Tracked
- Command usage frequency
- Error rates by type
- API response times
- User engagement metrics

### Logging
- All commands are logged with user ID and timestamp
- Errors are logged with full stack traces
- API calls are logged with response times

Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Use ESLint configuration
- Write tests for new features
- Update documentation
- Follow conventional commit messages

License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Acknowledgments

- [Discord.js](https://discord.js.org/) - Discord API library
- [Axios](https://axios-http.com/) - HTTP client
- [Express](https://expressjs.com/) - Backend API framework

Support

- Create an [Issue](https://github.com/yourusername/discord-url-shortener-bot/issues) for bugs
- Join our [Discord Server](https://discord.gg/your-server) for support
- Check [Documentation](https://github.com/yourusername/discord-url-shortener-bot/wiki) for detailed guides


*If this project helped you, please consider giving it a ⭐!*
