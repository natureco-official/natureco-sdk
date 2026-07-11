// Type definitions for natureco-sdk
// Official JavaScript SDK for NatureCo API

export interface NatureCoClientOptions {
  /** Custom API base URL (default: https://api.natureco.me/api/v1) */
  baseURL?: string;
  /** Request timeout in ms (default: 30000) */
  timeout?: number;
}

export type Platform = 'discord' | 'telegram' | 'slack' | 'instagram';
export type AnalyticsPeriod = 'day' | 'week' | 'month';

export class NatureCoClient {
  constructor(apiKey: string, options?: NatureCoClientOptions);
  apiKey: string;
  baseURL: string;
  timeout: number;

  bots: BotsModule;
  channels: ChannelsModule;
  messages: MessagesModule;
  webhooks: WebhooksModule;
  analytics: AnalyticsModule;
  user: UserModule;
  apiKeys: ApiKeysModule;
  widget: WidgetModule;

  request(method: string, endpoint: string, data?: unknown): Promise<any>;
}

export class BotsModule {
  list(): Promise<any>;
  create(params: { name: string; systemPrompt: string; model?: string }): Promise<any>;
  get(botId: string): Promise<any>;
  update(botId: string, params: { name?: string; systemPrompt?: string; model?: string }): Promise<any>;
  delete(botId: string): Promise<any>;
}

export class ChannelsModule {
  connect(params: { botId: string; platform: Platform; token: string; config?: Record<string, unknown> }): Promise<any>;
  list(botId: string): Promise<any>;
  disconnect(botId: string, channelId: string): Promise<any>;
  test(botId: string, channelId: string): Promise<any>;
}

export class MessagesModule {
  send(params: { botId: string; message: string; channel: string; userId: string }): Promise<any>;
  history(params: { botId: string; limit?: number; offset?: number }): Promise<any>;
  get(botId: string, messageId: string): Promise<any>;
}

export class WebhooksModule {
  create(params: { botId: string; url: string; events: string[]; secret?: string }): Promise<any>;
  list(botId: string): Promise<any>;
  get(botId: string, webhookId: string): Promise<any>;
  update(botId: string, webhookId: string, params: { url?: string; events?: string[]; active?: boolean }): Promise<any>;
  delete(botId: string, webhookId: string): Promise<any>;
  test(botId: string, webhookId: string): Promise<any>;
  logs(botId: string, webhookId: string, limit?: number): Promise<any>;
}

export class AnalyticsModule {
  get(params: { botId: string; period?: AnalyticsPeriod }): Promise<any>;
  messages(botId: string, params?: { startDate?: string; endDate?: string }): Promise<any>;
  channels(botId: string): Promise<any>;
  users(botId: string, params?: { limit?: number }): Promise<any>;
}

export class UserModule {
  me(): Promise<any>;
  update(params: { displayName?: string; bio?: string; avatar?: string }): Promise<any>;
}

export class ApiKeysModule {
  list(): Promise<any>;
  create(params: { name: string; scopes?: string[] }): Promise<any>;
  revoke(keyId: string): Promise<any>;
}

export class WidgetModule {
  getEmbedCode(botId: string, theme?: string, position?: string): string;
  getEmbedCode(options: { botId: string; theme?: string; position?: string }): string;
  updateSettings(params: { botId: string; theme?: string; position?: string; welcomeMessage?: string; primaryColor?: string }): Promise<any>;
  getSettings(botId: string): Promise<any>;
}

// ── NatureCo Account (SSO) ──────────────────────────────────────────────────

export interface NatureCoSession {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_at: number | null;
  user: { id: string; email: string } | null;
}

export interface NatureCoAuthStore {
  load(): NatureCoSession | null;
  save(session: NatureCoSession): void;
  clear(): void;
}

export interface NatureCoAuthOptions {
  /** Supabase URL (defaults to natureco.me identity project) */
  url?: string;
  /** Public anon key */
  anonKey?: string;
  /** Custom session store (defaults to ~/.natureco/auth.json in Node, memory in browser) */
  store?: NatureCoAuthStore;
}

export interface NatureCoUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

export class NatureCoAuth {
  constructor(options?: NatureCoAuthOptions);
  /** Sign in with email + password */
  loginWithPassword(email: string, password: string): Promise<NatureCoSession>;
  /** Passwordless: send an OTP code / login link to the email */
  sendOtp(email: string): Promise<{ sent: boolean; email: string }>;
  /** Verify the OTP code (tries email then magiclink type) */
  verifyOtp(email: string, token: string): Promise<NatureCoSession>;
  /** Sign in from a magic login-link email (implicit + token_hash flows) */
  verifyLink(link: string): Promise<NatureCoSession>;
  /** Refresh the access token */
  refresh(): Promise<NatureCoSession>;
  /** Valid (auto-refreshed) access token, or null */
  getAccessToken(): Promise<string | null>;
  /** The signed-in user, or null */
  whoami(): Promise<NatureCoUser | null>;
  isLoggedIn(): boolean;
  /** Sign out — clears the session */
  logout(): void;
}

export class NatureCoError extends Error {
  constructor(message: string, statusCode?: number, response?: unknown);
  name: 'NatureCoError';
  statusCode?: number;
  response?: unknown;
}
