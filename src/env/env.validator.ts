import * as Joi from 'joi';
import { AppEnv } from 'src/enums';

export default Joi.object({
  DATABASE_RETRY: Joi.number().default(3),

  DATABASE_SSL: Joi.boolean().default(false),

  NODE_ENV: Joi.string()
    .valid(AppEnv.DEVELOPMENT, AppEnv.TEST, AppEnv.STAGING, AppEnv.PRODUCTION)
    .default(AppEnv.DEVELOPMENT),

  PORT: Joi.number().default(8000),

  // APP_CACHE_URL: Joi.string().required(),
  // TOKEN_STORE_URL: Joi.string().required(),
  // TOKEN_STORE_SECRET: Joi.string().required(),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').optional(),
  DB_DATABASE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),

  SERVICE_NAME: Joi.string().required(),
});
