export enum DURATION {
  SECONDS = 1_000,
  MINUTES = 60 * SECONDS,
  HOURS = 60 * MINUTES,
  DAYS = 24 * HOURS,
}

export enum AppEnv {
  PRODUCTION = 'production',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
  TEST = 'test',
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export enum SettingType {
  TEXT = 'text',
  NUMBER = 'number',
  FLOAT = 'float',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
}

