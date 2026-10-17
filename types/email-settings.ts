export interface EmailSettings {
  storeId: string;
  storeSlug: string;
  enabled: boolean;
  host: string | null;
  port: number;
  secure: boolean;
  username: string | null;
  hasPassword: boolean;
  fromName: string | null;
  fromEmail: string | null;
  replyTo: string | null;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
  lastTestError: string | null;
  usingEnvFallback: boolean;
  envFallbackAvailable: boolean;
}

export interface UpdateEmailSettingsPayload {
  enabled?: boolean;
  host?: string | null;
  port?: number;
  secure?: boolean;
  username?: string | null;
  /** Write-only; omit or blank to keep the saved password. */
  password?: string;
  clearPassword?: boolean;
  fromName?: string | null;
  fromEmail?: string | null;
  replyTo?: string | null;
}
