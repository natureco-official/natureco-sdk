# NatureCo SDK

Official JavaScript SDK for NatureCo API - Build powerful AI chatbots and integrate them across multiple platforms.

[![npm version](https://img.shields.io/npm/v/natureco-sdk.svg)](https://www.npmjs.com/package/natureco-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📦 Installation

```bash
npm install natureco-sdk
```

Or using yarn:

```bash
yarn add natureco-sdk
```

For browser usage via CDN:

```html
<script src="https://unpkg.com/natureco-sdk@latest/index.js"></script>
```

## 🚀 Quick Start

```javascript
const { NatureCoClient } = require('natureco-sdk');

// Initialize the client with your API key
const client = new NatureCoClient('nc_your_api_key_here');

// Create a new bot
const bot = await client.bots.create({
  name: 'My First Bot',
  systemPrompt: 'You are a helpful assistant.',
  model: 'gpt-4'
});

console.log('Bot created:', bot);
```

## 🔑 Authentication

### Getting Your API Key

1. Go to [NatureCo Developers Portal](https://natureco.me/developers)
2. Navigate to **API Keys** section
3. Click **Generate New Key**
4. Copy your API key (starts with `nc_` or `nco_`)

### Initialize Client

```javascript
const { NatureCoClient } = require('natureco-sdk');

const client = new NatureCoClient('nc_your_api_key_here', {
  baseURL: 'https://api.natureco.me/api/v1', // Optional: custom API endpoint
  timeout: 30000 // Optional: request timeout in ms (default: 30000)
});
```

## 🤖 Bot Management

### Create a Bot

```javascript
const bot = await client.bots.create({
  name: 'Customer Support Bot',
  systemPrompt: 'You are a friendly customer support assistant. Help users with their questions.',
  model: 'gpt-4' // Options: 'gpt-4', 'gpt-3.5-turbo', 'claude-3'
});

console.log('Bot ID:', bot.botId);
```

### List All Bots

```javascript
const bots = await client.bots.list();

bots.forEach(bot => {
  console.log(`${bot.name} (${bot.botId})`);
});
```

### Get Bot Details

```javascript
const bot = await client.bots.get('bot_123456');

console.log('Bot name:', bot.name);
console.log('System prompt:', bot.systemPrompt);
console.log('Model:', bot.model);
```

### Update a Bot

```javascript
const updatedBot = await client.bots.update('bot_123456', {
  name: 'Updated Bot Name',
  systemPrompt: 'New system prompt',
  model: 'gpt-4'
});
```

### Delete a Bot

```javascript
await client.bots.delete('bot_123456');
console.log('Bot deleted successfully');
```

## 📱 Channel Integration

Connect your bot to Discord, Telegram, Slack, Instagram, and more.

### Connect Discord

```javascript
const channel = await client.channels.connect({
  botId: 'bot_123456',
  platform: 'discord',
  token: 'your_discord_bot_token',
  config: {
    guildId: 'your_guild_id', // Optional
    commandPrefix: '!' // Optional
  }
});
```

### Connect Telegram

```javascript
const channel = await client.channels.connect({
  botId: 'bot_123456',
  platform: 'telegram',
  token: 'your_telegram_bot_token'
});
```

### Connect Slack

```javascript
const channel = await client.channels.connect({
  botId: 'bot_123456',
  platform: 'slack',
  token: 'xoxb-your-slack-bot-token',
  config: {
    signingSecret: 'your_signing_secret'
  }
});
```

### Connect Instagram

```javascript
const channel = await client.channels.connect({
  botId: 'bot_123456',
  platform: 'instagram',
  token: 'your_instagram_access_token',
  config: {
    pageId: 'your_page_id',
    verifyToken: 'your_verify_token'
  }
});
```

### List Connected Channels

```javascript
const channels = await client.channels.list('bot_123456');

channels.forEach(channel => {
  console.log(`${channel.platform}: ${channel.isActive ? 'Active' : 'Inactive'}`);
});
```

### Disconnect a Channel

```javascript
await client.channels.disconnect('bot_123456', 'channel_789');
console.log('Channel disconnected');
```

### Test Channel Connection

```javascript
const result = await client.channels.test('bot_123456', 'channel_789');
console.log('Test result:', result.success ? 'Passed' : 'Failed');
```

## 💬 Messaging

### Send a Message

```javascript
const response = await client.messages.send({
  botId: 'bot_123456',
  message: 'Hello! How can I help you today?',
  channel: 'web', // 'web', 'discord', 'telegram', etc.
  userId: 'user_123'
});

console.log('Bot response:', response.reply);
```

### Get Message History

```javascript
const messages = await client.messages.history({
  botId: 'bot_123456',
  limit: 50,
  offset: 0
});

messages.forEach(msg => {
  console.log(`[${msg.timestamp}] ${msg.userId}: ${msg.message}`);
  console.log(`Bot: ${msg.reply}`);
});
```

### Get Specific Message

```javascript
const message = await client.messages.get('bot_123456', 'msg_789');
console.log('Message:', message);
```

## 🔔 Webhooks

Receive real-time notifications when events occur.

### Create a Webhook

```javascript
const webhook = await client.webhooks.create({
  botId: 'bot_123456',
  url: 'https://your-domain.com/webhook',
  events: ['message.received', 'message.sent', 'bot.error'],
  secret: 'your_webhook_secret' // Optional: for signature verification
});

console.log('Webhook ID:', webhook.id);
```

### Available Events

- `message.received` - New message received from user
- `message.sent` - Bot sent a message
- `bot.error` - Bot encountered an error
- `channel.connected` - New channel connected
- `channel.disconnected` - Channel disconnected
- `user.joined` - New user started conversation
- `analytics.daily` - Daily analytics summary

### List Webhooks

```javascript
const webhooks = await client.webhooks.list('bot_123456');

webhooks.forEach(webhook => {
  console.log(`${webhook.url}: ${webhook.active ? 'Active' : 'Inactive'}`);
});
```

### Update Webhook

```javascript
const updated = await client.webhooks.update('bot_123456', 'webhook_789', {
  url: 'https://new-domain.com/webhook',
  events: ['message.received'],
  active: true
});
```

### Delete Webhook

```javascript
await client.webhooks.delete('bot_123456', 'webhook_789');
```

### Test Webhook

```javascript
const result = await client.webhooks.test('bot_123456', 'webhook_789');
console.log('Test result:', result);
```

### View Webhook Logs

```javascript
const logs = await client.webhooks.logs('bot_123456', 'webhook_789', 20);

logs.forEach(log => {
  console.log(`[${log.timestamp}] ${log.event}: ${log.status}`);
});
```

### Webhook Payload Example

```javascript
// Your webhook endpoint will receive:
{
  "event": "message.received",
  "timestamp": "2024-01-15T10:30:00Z",
  "botId": "bot_123456",
  "data": {
    "messageId": "msg_789",
    "userId": "user_123",
    "message": "Hello bot!",
    "channel": "discord",
    "metadata": {
      "username": "john_doe",
      "channelId": "channel_456"
    }
  }
}
```

### Verify Webhook Signature

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(payload)).digest('hex');
  return signature === digest;
}

// In your webhook handler:
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-natureco-signature'];
  const isValid = verifyWebhookSignature(req.body, signature, 'your_webhook_secret');
  
  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook...
  res.status(200).send('OK');
});
```

## 🎨 Web Widget

Embed a chat widget on your website.

### Basic Embed

```javascript
const embedCode = client.widget.getEmbedCode('bot_123456');
console.log(embedCode);
// Output: <script src="https://api.natureco.me/widget.js" data-bot-id="bot_123456" data-theme="light" data-position="bottom-right"></script>
```

### Custom Theme and Position

```javascript
const embedCode = client.widget.getEmbedCode({
  botId: 'bot_123456',
  theme: 'dark', // 'light' or 'dark'
  position: 'bottom-left' // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
});
```

### HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to my website</h1>
  
  <!-- Add this before closing </body> tag -->
  <script 
    src="https://api.natureco.me/widget.js" 
    data-bot-id="bot_123456" 
    data-theme="dark" 
    data-position="bottom-right"
    data-welcome-message="Hi! How can I help you today?"
    data-primary-color="#22c55e">
  </script>
</body>
</html>
```

### Update Widget Settings

```javascript
await client.widget.updateSettings({
  botId: 'bot_123456',
  theme: 'dark',
  position: 'bottom-right',
  welcomeMessage: 'Hello! How can I assist you?',
  primaryColor: '#22c55e'
});
```

### Get Widget Settings

```javascript
const settings = await client.widget.getSettings('bot_123456');
console.log('Widget settings:', settings);
```

### Widget Customization Options

```html
<script 
  src="https://api.natureco.me/widget.js" 
  data-bot-id="bot_123456"
  data-theme="dark"
  data-position="bottom-right"
  data-welcome-message="Hi there! 👋"
  data-primary-color="#22c55e"
  data-button-size="60"
  data-window-width="400"
  data-window-height="600"
  data-z-index="9999">
</script>
```

## 📊 Analytics

### Get Bot Analytics

```javascript
// Get weekly analytics
const analytics = await client.analytics.get({
  botId: 'bot_123456',
  period: 'week' // 'day', 'week', or 'month'
});

console.log('Total messages:', analytics.totalMessages);
console.log('Active users:', analytics.activeUsers);
console.log('Average response time:', analytics.avgResponseTime);
```

### Message Analytics

```javascript
const messageStats = await client.analytics.messages('bot_123456', {
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

console.log('Messages sent:', messageStats.sent);
console.log('Messages received:', messageStats.received);
```

### Channel Analytics

```javascript
const channelStats = await client.analytics.channels('bot_123456');

channelStats.forEach(channel => {
  console.log(`${channel.platform}: ${channel.messageCount} messages`);
});
```

### User Analytics

```javascript
const users = await client.analytics.users('bot_123456', { limit: 100 });

users.forEach(user => {
  console.log(`${user.userId}: ${user.messageCount} messages, last seen ${user.lastSeen}`);
});
```

## 👤 User Management

### Get Current User

```javascript
const user = await client.user.me();

console.log('User ID:', user.id);
console.log('Display name:', user.displayName);
console.log('Email:', user.email);
```

### Update User Profile

```javascript
await client.user.update({
  displayName: 'John Doe',
  bio: 'AI enthusiast and developer',
  avatar: 'https://example.com/avatar.jpg'
});
```

## 🔐 API Key Management

### List API Keys

```javascript
const keys = await client.apiKeys.list();

keys.forEach(key => {
  console.log(`${key.name}: ${key.scopes.join(', ')}`);
});
```

### Create New API Key

```javascript
const newKey = await client.apiKeys.create({
  name: 'Production Key',
  scopes: ['bots:read', 'bots:write', 'messages:send']
});

console.log('New API key:', newKey.key);
// IMPORTANT: Save this key securely, it won't be shown again!
```

### Revoke API Key

```javascript
await client.apiKeys.revoke('key_123456');
console.log('API key revoked');
```

## 🛠️ Advanced Usage

### Error Handling

```javascript
const { NatureCoClient, NatureCoError } = require('natureco-sdk');

try {
  const bot = await client.bots.create({
    name: 'My Bot',
    systemPrompt: 'You are helpful.'
  });
} catch (error) {
  if (error instanceof NatureCoError) {
    console.error('API Error:', error.message);
    console.error('Status code:', error.statusCode);
    console.error('Response:', error.response);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Custom Timeout

```javascript
const client = new NatureCoClient('nc_your_api_key', {
  timeout: 60000 // 60 seconds
});
```

### Custom Base URL (Self-hosted)

```javascript
const client = new NatureCoClient('nc_your_api_key', {
  baseURL: 'https://your-custom-domain.com/api/v1'
});
```

### Retry Logic

```javascript
async function retryRequest(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Usage
const bot = await retryRequest(() => 
  client.bots.create({
    name: 'My Bot',
    systemPrompt: 'You are helpful.'
  })
);
```

## 🌐 Browser Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>NatureCo SDK Browser Example</title>
</head>
<body>
  <h1>Chat with Bot</h1>
  <input type="text" id="message" placeholder="Type a message...">
  <button onclick="sendMessage()">Send</button>
  <div id="response"></div>

  <script src="https://unpkg.com/natureco-sdk@latest/index.js"></script>
  <script>
    const client = new NatureCoClient('nc_your_api_key');

    async function sendMessage() {
      const message = document.getElementById('message').value;
      
      try {
        const response = await client.messages.send({
          botId: 'bot_123456',
          message: message,
          channel: 'web',
          userId: 'user_' + Date.now()
        });
        
        document.getElementById('response').innerText = response.reply;
      } catch (error) {
        console.error('Error:', error);
      }
    }
  </script>
</body>
</html>
```

## 📚 Complete Example

```javascript
const { NatureCoClient } = require('natureco-sdk');

async function main() {
  // Initialize client
  const client = new NatureCoClient('nc_your_api_key');

  try {
    // Create a bot
    const bot = await client.bots.create({
      name: 'Customer Support Bot',
      systemPrompt: 'You are a helpful customer support assistant.',
      model: 'gpt-4'
    });
    console.log('✅ Bot created:', bot.botId);

    // Connect to Discord
    await client.channels.connect({
      botId: bot.botId,
      platform: 'discord',
      token: process.env.DISCORD_TOKEN
    });
    console.log('✅ Discord connected');

    // Create webhook
    const webhook = await client.webhooks.create({
      botId: bot.botId,
      url: 'https://your-domain.com/webhook',
      events: ['message.received', 'message.sent'],
      secret: 'your_secret'
    });
    console.log('✅ Webhook created:', webhook.id);

    // Get embed code for website
    const embedCode = client.widget.getEmbedCode({
      botId: bot.botId,
      theme: 'dark',
      position: 'bottom-right'
    });
    console.log('✅ Widget embed code:', embedCode);

    // Send a test message
    const response = await client.messages.send({
      botId: bot.botId,
      message: 'Hello! This is a test.',
      channel: 'web',
      userId: 'test_user'
    });
    console.log('✅ Bot response:', response.reply);

    // Get analytics
    const analytics = await client.analytics.get({
      botId: bot.botId,
      period: 'week'
    });
    console.log('✅ Analytics:', analytics);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
```

## 🔗 Useful Links

- [Official Documentation](https://natureco.me/docs)
- [API Reference](https://natureco.me/docs/api)
- [Developers Portal](https://natureco.me/developers)
- [GitHub Repository](https://github.com/natureco/natureco-sdk)
- [Support](https://natureco.me/support)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 💬 Support

- Email: support@natureco.me
- Discord: [Join our community](https://discord.gg/natureco)
- Twitter: [@natureco](https://twitter.com/natureco)

## 📝 Changelog

### v1.0.5 (Latest)
- Updated README with comprehensive examples
- Added webhook signature verification
- Improved error handling documentation
- Added browser usage examples

### v1.0.4
- Added widget customization options
- Improved API key validation
- Bug fixes and performance improvements

### v1.0.3
- Added analytics module
- Added user management
- Added API key management

### v1.0.2
- Added webhook support
- Improved error handling
- Added timeout configuration

### v1.0.1
- Initial release
- Bot management
- Channel integration
- Messaging support

---

Made with ❤️ by [NatureCo](https://natureco.me)
