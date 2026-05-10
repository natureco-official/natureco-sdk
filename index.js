/**
 * NatureCo JavaScript SDK
 * @version 1.0.5
 * @description Official JavaScript SDK for NatureCo API
 */

class NatureCoClient {
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    // Validate API key format (accept both nc_ and nco_ prefixes)
    if (!apiKey.startsWith('nc_') && !apiKey.startsWith('nco_')) {
      throw new Error('Invalid API key format. Key must start with nc_ or nco_');
    }

    this.apiKey = apiKey;
    this.baseURL = options.baseURL || 'https://api.natureco.me/api/v1';
    this.timeout = options.timeout || 30000;

    // Initialize modules
    this.bots = new BotsModule(this);
    this.channels = new ChannelsModule(this);
    this.messages = new MessagesModule(this);
    this.webhooks = new WebhooksModule(this);
    this.analytics = new AnalyticsModule(this);
    this.user = new UserModule(this);
    this.apiKeys = new ApiKeysModule(this);
    this.widget = new WidgetModule(this);
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const config = {
      method,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        throw new NatureCoError(
          responseData.error || 'Request failed',
          response.status,
          responseData
        );
      }

      return responseData;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new NatureCoError('Request timeout', 408);
      }
      throw error;
    }
  }
}

// Bot Management Module
class BotsModule {
  constructor(client) {
    this.client = client;
  }

  async list() {
    return this.client.request('GET', '/bots');
  }

  async create({ name, systemPrompt, model = 'gpt-4' }) {
    return this.client.request('POST', '/bots', {
      name,
      system_prompt: systemPrompt,
      model,
    });
  }

  async get(botId) {
    return this.client.request('GET', `/bots/${botId}`);
  }

  async update(botId, { name, systemPrompt, model }) {
    const data = {};
    if (name) data.name = name;
    if (systemPrompt) data.system_prompt = systemPrompt;
    if (model) data.model = model;

    return this.client.request('PUT', `/bots/${botId}`, data);
  }

  async delete(botId) {
    return this.client.request('DELETE', `/bots/${botId}`);
  }
}

// Channel Integration Module
class ChannelsModule {
  constructor(client) {
    this.client = client;
  }

  async connect({ botId, platform, token, config = {} }) {
    const validPlatforms = ['discord', 'telegram', 'slack', 'instagram'];
    if (!validPlatforms.includes(platform)) {
      throw new Error(`Invalid platform. Must be one of: ${validPlatforms.join(', ')}`);
    }

    return this.client.request('POST', `/bots/${botId}/channels`, {
      platform,
      token,
      config,
    });
  }

  async list(botId) {
    return this.client.request('GET', `/bots/${botId}/channels`);
  }

  async disconnect(botId, channelId) {
    return this.client.request('DELETE', `/bots/${botId}/channels/${channelId}`);
  }

  async test(botId, channelId) {
    return this.client.request('POST', `/bots/${botId}/channels/${channelId}/test`);
  }
}

// Messaging Module
class MessagesModule {
  constructor(client) {
    this.client = client;
  }

  async send({ botId, message, channel, userId }) {
    return this.client.request('POST', `/bots/${botId}/messages`, {
      message,
      channel,
      user_id: userId,
    });
  }

  async history({ botId, limit = 50, offset = 0 }) {
    return this.client.request('GET', `/bots/${botId}/messages?limit=${limit}&offset=${offset}`);
  }

  async get(botId, messageId) {
    return this.client.request('GET', `/bots/${botId}/messages/${messageId}`);
  }
}

// Webhook Module
class WebhooksModule {
  constructor(client) {
    this.client = client;
  }

  async create({ botId, url, events, secret }) {
    return this.client.request('POST', `/bots/${botId}/webhooks`, {
      url,
      events,
      secret,
    });
  }

  async list(botId) {
    return this.client.request('GET', `/bots/${botId}/webhooks`);
  }

  async get(botId, webhookId) {
    return this.client.request('GET', `/bots/${botId}/webhooks/${webhookId}`);
  }

  async update(botId, webhookId, { url, events, active }) {
    const data = {};
    if (url) data.url = url;
    if (events) data.events = events;
    if (typeof active === 'boolean') data.active = active;

    return this.client.request('PATCH', `/bots/${botId}/webhooks/${webhookId}`, data);
  }

  async delete(botId, webhookId) {
    return this.client.request('DELETE', `/bots/${botId}/webhooks/${webhookId}`);
  }

  async test(botId, webhookId) {
    return this.client.request('POST', `/bots/${botId}/webhooks/${webhookId}/test`);
  }

  async logs(botId, webhookId, limit = 20) {
    return this.client.request('GET', `/bots/${botId}/webhooks/${webhookId}/logs?limit=${limit}`);
  }
}

// Analytics Module
class AnalyticsModule {
  constructor(client) {
    this.client = client;
  }

  async get({ botId, period = 'week' }) {
    const validPeriods = ['day', 'week', 'month'];
    if (!validPeriods.includes(period)) {
      throw new Error(`Invalid period. Must be one of: ${validPeriods.join(', ')}`);
    }

    return this.client.request('GET', `/bots/${botId}/analytics?period=${period}`);
  }

  async messages(botId, { startDate, endDate } = {}) {
    let endpoint = `/bots/${botId}/analytics/messages`;
    const params = [];
    if (startDate) params.push(`start_date=${startDate}`);
    if (endDate) params.push(`end_date=${endDate}`);
    if (params.length) endpoint += `?${params.join('&')}`;

    return this.client.request('GET', endpoint);
  }

  async channels(botId) {
    return this.client.request('GET', `/bots/${botId}/analytics/channels`);
  }

  async users(botId, { limit = 100 } = {}) {
    return this.client.request('GET', `/bots/${botId}/analytics/users?limit=${limit}`);
  }
}

// User Module
class UserModule {
  constructor(client) {
    this.client = client;
  }

  async me() {
    return this.client.request('GET', '/user/me');
  }

  async update({ displayName, bio, avatar }) {
    const data = {};
    if (displayName) data.display_name = displayName;
    if (bio) data.bio = bio;
    if (avatar) data.avatar = avatar;

    return this.client.request('PATCH', '/user/me', data);
  }
}

// API Keys Module
class ApiKeysModule {
  constructor(client) {
    this.client = client;
  }

  async list() {
    return this.client.request('GET', '/api-keys');
  }

  async create({ name, scopes = [] }) {
    return this.client.request('POST', '/api-keys', {
      name,
      scopes,
    });
  }

  async revoke(keyId) {
    return this.client.request('DELETE', `/api-keys/${keyId}`);
  }
}

// Widget Module
class WidgetModule {
  constructor(client) {
    this.client = client;
  }

  getEmbedCode(botIdOrOptions, theme = 'light', position = 'bottom-right') {
    // Backward compatibility: botId string olarak geçilebilir veya options object
    let botId, finalTheme, finalPosition;
    
    if (typeof botIdOrOptions === 'string') {
      // Eski kullanım: getEmbedCode(botId, theme, position)
      botId = botIdOrOptions;
      finalTheme = theme;
      finalPosition = position;
    } else if (typeof botIdOrOptions === 'object') {
      // Yeni kullanım: getEmbedCode({ botId, theme, position })
      botId = botIdOrOptions.botId;
      finalTheme = botIdOrOptions.theme || 'light';
      finalPosition = botIdOrOptions.position || 'bottom-right';
    } else {
      throw new Error('botId is required');
    }

    if (!botId) {
      throw new Error('botId is required');
    }

    return `<script src="https://api.natureco.me/widget.js" data-bot-id="${botId}" data-theme="${finalTheme}" data-position="${finalPosition}"></script>`;
  }

  async updateSettings({ botId, theme, position, welcomeMessage, primaryColor }) {
    const data = {};
    if (theme) data.theme = theme;
    if (position) data.position = position;
    if (welcomeMessage) data.welcome_message = welcomeMessage;
    if (primaryColor) data.primary_color = primaryColor;

    return this.client.request('PATCH', `/bots/${botId}/widget`, data);
  }

  async getSettings(botId) {
    return this.client.request('GET', `/bots/${botId}/widget`);
  }
}

// Custom Error Class
class NatureCoError extends Error {
  constructor(message, statusCode, response) {
    super(message);
    this.name = 'NatureCoError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NatureCoClient, NatureCoError };
} else if (typeof window !== 'undefined') {
  window.NatureCoClient = NatureCoClient;
  window.NatureCoError = NatureCoError;
}
