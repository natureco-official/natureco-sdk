/**
 * NatureCo JavaScript SDK
 * @version 1.2.0
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

// ════════════════════════════════════════════════════════════════════════════
// NatureCoAuth — tek NatureCo hesabı (SSO). natureco.me Supabase Auth üstünde,
// bağımlılıksız (Supabase REST + global fetch). CLI/terminal/portal aynı hesabı
// paylaşır. Oturum ~/.natureco/auth.json'da saklanır (Node); tarayıcıda bellekte.
// ════════════════════════════════════════════════════════════════════════════

// natureco.me kimlik projesi — anon key PUBLIC (client'lara gömülür, gizli değil)
const NC_SUPABASE_URL = 'https://mxnlehflfkesasclcldy.supabase.co';
const NC_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14bmxlaGZsZmtlc2FzY2xjbGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NDA5MzEsImV4cCI6MjA5MjIxNjkzMX0.93aPOg6bVmgFaJvsM5jVZwiX2TTuFIyAzhP6BlhBkGU';

class NatureCoAuth {
  /**
   * @param {object} [options]
   * @param {string} [options.url]      Supabase URL (varsayılan natureco.me)
   * @param {string} [options.anonKey]  public anon key
   * @param {object} [options.store]    { load(): session|null, save(session), clear() } — özel oturum deposu
   */
  constructor(options = {}) {
    this.url = options.url || NC_SUPABASE_URL;
    this.anonKey = options.anonKey || NC_SUPABASE_ANON;
    this.authBase = `${this.url}/auth/v1`;
    this.store = options.store || _defaultStore();
    this._session = this.store.load();
  }

  async _post(path, body, accessToken) {
    const headers = { 'apikey': this.anonKey, 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
    const res = await fetch(`${this.authBase}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new NatureCoError(data.error_description || data.msg || data.error || 'Auth hatası', res.status, data);
    return data;
  }

  _persist(session) {
    this._session = session;
    try { this.store.save(session); } catch (_) {}
    return session;
  }

  /** E-posta + şifre ile giriş → oturum saklanır */
  async loginWithPassword(email, password) {
    const s = await this._post('/token?grant_type=password', { email, password });
    return this._persist(_shape(s));
  }

  /** Şifresiz: e-postaya OTP kodu gönder (mevcut hesap; kayıt açmaz) */
  async sendOtp(email) {
    await this._post('/otp', { email, create_user: false });
    return { sent: true, email };
  }

  /**
   * Verify the OTP code → session saved. Depending on the Supabase email
   * template, the code's verification type may be 'email' or 'magiclink',
   * so both are attempted.
   */
  async verifyOtp(email, token) {
    const code = String(token).replace(/\s+/g, '');
    try {
      return this._persist(_shape(await this._post('/verify', { type: 'email', email, token: code })));
    } catch (e1) {
      try {
        return this._persist(_shape(await this._post('/verify', { type: 'magiclink', email, token: code })));
      } catch (_) {
        throw e1;
      }
    }
  }

  /**
   * Verify a magic LOGIN LINK from the email (when the template sends a link
   * instead of a 6-digit code). Two shapes are supported:
   *   1) Implicit flow: the link fragment already carries access_token +
   *      refresh_token → session is created directly.
   *   2) token_hash: verified via /verify.
   * Works in Node and the browser.
   */
  async verifyLink(link) {
    let u;
    try { u = new URL(String(link).trim()); }
    catch (e) { throw new NatureCoError('Invalid link', 400, { cause: e }); }
    const q = u.searchParams;
    const frag = new URLSearchParams((u.hash || '').replace(/^#/, ''));
    const pick = (k) => frag.get(k) || q.get(k);

    const access_token = pick('access_token');
    if (access_token) {
      return this._persist(_shape({
        access_token,
        refresh_token: pick('refresh_token'),
        token_type: pick('token_type') || 'bearer',
        expires_at: parseInt(pick('expires_at') || '0', 10) || null,
        expires_in: parseInt(pick('expires_in') || '0', 10) || null,
        user: _userFromJwt(access_token),
      }));
    }
    const token_hash = pick('token_hash') || pick('token');
    const type = pick('type') || 'magiclink';
    if (!token_hash) throw new NatureCoError('No verification token found in link', 400);
    return this._persist(_shape(await this._post('/verify', { type, token_hash })));
  }

  /** Refresh token ile access token yenile */
  async refresh() {
    if (!this._session || !this._session.refresh_token) throw new NatureCoError('Oturum yok — önce giriş yapın', 401);
    const s = await this._post('/token?grant_type=refresh_token', { refresh_token: this._session.refresh_token });
    return this._persist(_shape(s));
  }

  /** Geçerli (gerekirse yenilenmiş) access token */
  async getAccessToken() {
    if (!this._session) return null;
    if (this._session.expires_at && Date.now() / 1000 > this._session.expires_at - 60) {
      try { await this.refresh(); } catch (_) { return null; }
    }
    return this._session ? this._session.access_token : null;
  }

  /** Giriş yapan kullanıcıyı döndür ({ id, email, ... }) veya null */
  async whoami() {
    const token = await this.getAccessToken();
    if (!token) return null;
    const res = await fetch(`${this.authBase}/user`, { headers: { 'apikey': this.anonKey, 'Authorization': `Bearer ${token}` } });
    if (!res.ok) return null;
    return res.json();
  }

  isLoggedIn() { return !!(this._session && this._session.access_token); }

  /** Çıkış — oturumu sil */
  logout() {
    this._session = null;
    try { this.store.clear(); } catch (_) {}
  }
}

// JWT access_token içinden kullanıcıyı çöz (imza doğrulaması yok — yalnız görüntüleme).
// Node (Buffer) ve tarayıcı (atob) ortamlarında çalışır.
function _userFromJwt(token) {
  try {
    const b64 = String(token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    let json;
    if (typeof Buffer !== 'undefined') json = Buffer.from(b64, 'base64').toString('utf8');
    else json = decodeURIComponent(escape(atob(b64)));
    const p = JSON.parse(json);
    return { id: p.sub, email: p.email };
  } catch (_) { return null; }
}

// Supabase token yanıtını sade bir oturuma indir
function _shape(s) {
  return {
    access_token: s.access_token,
    refresh_token: s.refresh_token,
    token_type: s.token_type || 'bearer',
    expires_at: s.expires_at || (s.expires_in ? Math.floor(Date.now() / 1000) + s.expires_in : null),
    user: s.user ? { id: s.user.id, email: s.user.email } : null,
  };
}

// Varsayılan oturum deposu: Node'da ~/.natureco/auth.json (0600); tarayıcıda bellekte
function _defaultStore() {
  try {
    const fs = require('fs'); const os = require('os'); const path = require('path');
    const dir = path.join(os.homedir(), '.natureco');
    const file = path.join(dir, 'auth.json');
    return {
      load() { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return null; } },
      save(s) { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(file, JSON.stringify(s, null, 2)); try { fs.chmodSync(file, 0o600); } catch (_) {} },
      clear() { try { fs.unlinkSync(file); } catch (_) {} },
    };
  } catch (_) {
    let mem = null; // tarayıcı / fs yok
    return { load: () => mem, save: (s) => { mem = s; }, clear: () => { mem = null; } };
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
  module.exports = { NatureCoClient, NatureCoAuth, NatureCoError };
} else if (typeof window !== 'undefined') {
  window.NatureCoClient = NatureCoClient;
  window.NatureCoAuth = NatureCoAuth;
  window.NatureCoError = NatureCoError;
}
