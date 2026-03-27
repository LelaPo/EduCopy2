# Homework Bot for Telegram

A professional Telegram bot that fetches homework assignments and class schedules from a private education API (authedu.mosreg.ru). Built with production-ready architecture, modular design, and optimized for Docker deployment on Ubuntu.

## Features

- **Homework Management**: View homework assignments by date range (today, tomorrow, week)
- **Subject Filtering**: Filter homework by specific subjects
- **Class Schedule**: View class schedules with times, rooms, and teacher information
- **Access Control**: Key-based access system with admin panel for key generation
- **SOCKS5 Proxy Support**: Optional proxy configuration for Telegram connections
- **Beautiful UI**: Formatted messages with emojis and inline keyboards
- **Production Ready**: Graceful shutdown, structured logging, error handling

## Project Structure

```
homework-bot/
├── src/
│   ├── bot/
│   │   ├── index.js              # Bot initialization
│   │   ├── handlers/
│   │   │   ├── start.js          # /start, /help commands
│   │   │   ├── access.js         # Access key handling
│   │   │   ├── admin.js          # Admin panel commands
│   │   │   ├── homework.js       # Homework view & filtering
│   │   │   └── schedule.js       # Schedule view
│   │   ├── keyboards/
│   │   │   ├── main.js           # Main menu & admin keyboards
│   │   │   ├── date.js           # Date selection calendar
│   │   │   └── subjects.js       # Subject filter keyboards
│   │   └── middleware/
│   │       ├── auth.js           # Access control middleware
│   │       └── logging.js        # Request logging
│   ├── api/
│   │   ├── client.js             # Axios API client
│   │   ├── endpoints.js          # API endpoint definitions
│   │   └── types.js              # Response transformers
│   ├── database/
│   │   ├── index.js              # Database initialization
│   │   ├── schema.sql            # SQLite schema
│   │   └── models/
│   │       ├── User.js           # User model
│   │       └── AccessKey.js      # Access key model
│   ├── utils/
│   │   ├── logger.js             # Pino logger config
│   │   ├── config.js             # Environment config
│   │   ├── formatters.js         # Message formatters
│   │   └── date.js               # Date utilities
│   └── index.js                  # Application entry point
├── .env.example                  # Environment template
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Docker Compose config
├── package.json                  # Dependencies
└── README.md                     # This file
```

## Prerequisites

- Node.js 18.0 or higher
- Docker and Docker Compose (for containerized deployment)
- Telegram Bot Token (from @BotFather)
- Access to the education API with Bearer token

## Configuration

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:

| Variable | Description | Required |
|----------|-------------|----------|
| `BOT_TOKEN` | Telegram bot token from @BotFather | Yes |
| `API_BASE_URL` | Education API base URL | Yes |
| `API_BEARER_TOKEN` | Bearer token for API authentication | Yes |
| `ADMIN_ID` | Your Telegram ID (numeric) | Yes |
| `DB_PATH` | SQLite database path | No (default: ./data/homework_bot.db) |
| `PROXY_HOST` | SOCKS5 proxy host | No |
| `PROXY_PORT` | SOCKS5 proxy port | No |
| `PROXY_USER` | Proxy username | No |
| `PROXY_PASS` | Proxy password | No |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | No (default: info) |

### Getting Your Telegram ID

Send a message to [@userinfobot](https://t.me/userinfobot) or [@getmyid_bot](https://t.me/getmyid_bot) to get your Telegram ID.

## Quick Start

### Development (Local)

```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your values

# Start the bot
npm start

# Development mode with auto-reload
npm run dev
```

### Production (Docker)

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your values

# Build and start with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the bot
docker-compose down
```

### Production (Docker - Manual)

```bash
# Build the image
docker build -t homework-bot:latest .

# Run the container
docker run -d \
  --name homework-bot \
  --restart unless-stopped \
  -v bot_data:/app/data \
  --env-file .env \
  homework-bot:latest

# View logs
docker logs -f homework-bot
```

## Usage

### User Commands

| Command | Description |
|---------|-------------|
| `/start` | Start the bot and see main menu |
| `/help` | Show help message with available commands |
| `/key` | Enter an access key to unlock the bot |
| `/homework` | View homework assignments |
| `/schedule` | View class schedule |
| `/cancel` | Cancel current operation |

### Admin Commands

| Command | Description |
|---------|-------------|
| `/admin` | Open admin panel (admin only) |

### Admin Panel Features

1. **Generate Access Key**: Create a new unique access key for users
2. **Statistics**: View user and key statistics
3. **User List**: See all registered users and their access status

### User Flow

1. User sends `/start` to the bot
2. If user doesn't have access, they're prompted to enter a key
3. Admin generates a key using `/admin` → "Generate Key"
4. Admin sends the key to the user
5. User enters the key using `/key` command
6. User now has full access to all features

## API Integration

The bot integrates with the education API using the following endpoints:

### Homework Endpoint
```
GET /api/family/web/v1/homeworks
Params:
  - from: Start date (YYYY-MM-DD)
  - to: End date (YYYY-MM-DD)
  - student_id: Student identifier
```

### Schedule Endpoint
```
GET /api/family/web/v1/schedule/short
Params:
  - student_id: Student identifier
  - dates: Comma-separated dates (YYYY-MM-DD)
```

### Response Handling

The bot handles API errors gracefully:
- **401 Unauthorized**: Logs token expiration, can be extended with refresh logic
- **403 Forbidden**: Displays user-friendly error message
- **Network errors**: Retries and displays appropriate messages

## Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| telegram_id | INTEGER | Unique Telegram user ID |
| username | TEXT | Telegram username |
| first_name | TEXT | First name |
| last_name | TEXT | Last name |
| has_access | INTEGER | Access status (0/1) |
| created_at | DATETIME | Registration timestamp |
| updated_at | DATETIME | Last update timestamp |

### Access Keys Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| key | TEXT | Unique access key (12 chars) |
| is_used | INTEGER | Usage status (0/1) |
| used_by | INTEGER | Telegram ID of user |
| created_at | DATETIME | Generation timestamp |
| used_at | DATETIME | Usage timestamp |

## Logging

The bot uses Pino for structured JSON logging. Logs include:
- Incoming requests (message type, user info)
- Request duration
- Errors and exceptions
- Startup/shutdown events

Log levels: `debug` < `info` < `warn` < `error`

Set `LOG_LEVEL` in `.env` to control verbosity.

## Graceful Shutdown

The bot handles shutdown signals properly:
- **SIGINT** (Ctrl+C): Stops bot, closes database
- **SIGTERM** (Docker stop): Stops bot, closes database
- **uncaughtException**: Logs error, performs cleanup
- **unhandledRejection**: Logs error, performs cleanup

## Troubleshooting

### Bot doesn't respond to commands

1. Check if bot token is correct in `.env`
2. Verify bot is not already running elsewhere
3. Check logs for errors: `docker-compose logs`

### "Missing required environment variables"

Ensure all required variables are set in `.env`:
- `BOT_TOKEN`
- `API_BASE_URL`
- `API_BEARER_TOKEN`
- `ADMIN_ID`

### API returns 401/403

1. Verify `API_BEARER_TOKEN` is correct
2. Check if token has expired (contact API administrator)
3. Verify API base URL is correct

### Database errors

1. Ensure the `data/` directory is writable
2. Check Docker volume permissions
3. Try removing the database file and restarting

### Proxy connection issues

1. Verify SOCKS5 proxy is accessible
2. Check proxy credentials (if required)
3. Test proxy connectivity separately

## Security Considerations

- Bot token and API credentials are stored in `.env` (gitignored)
- Database uses prepared statements to prevent SQL injection
- Non-root user in Docker container
- Access keys are single-use only
- Admin commands verify Telegram ID

## Performance

- SQLite with WAL mode for concurrent reads
- Prepared statements for database queries
- Axios interceptors for efficient API calls
- In-memory session storage for user preferences

## License

MIT

## Support

For issues and feature requests, please contact the bot administrator.
