import dotenv from 'dotenv';
dotenv.config();

function getEnv(variable: string, optional: boolean = false) {
  if (process.env[variable] === undefined) {
    if (optional) {
      console.warn(
        `[@env]: Environmental variable for ${variable} is not supplied. \n So a default value will be generated for you.`,
      );
    } else {
      throw new Error(
        `You must create an environment variable for ${variable}`,
      );
    }
  }

  return process.env[variable]?.replace(/\\n/gm, '\n');
}

//environments
export const env = {
  isDev: String(process.env.NODE_ENV).toLowerCase().includes('dev'),
  isTest: String(process.env.NODE_ENV).toLowerCase().includes('test'),
  isProd: String(process.env.NODE_ENV).toLowerCase().includes('prod'),
  isStaging: String(process.env.NODE_ENV).toLowerCase().includes('staging'),
  env: process.env.NODE_ENV,
};

export const PORT = getEnv('PORT')!;
export const DATABASE_URL = getEnv('DATABASE_URL')!;
export const JWT_SECRET_KEY = getEnv('JWT_SECRET_KEY')!;
export const COOKIE_SECRET = getEnv('COOKIE_SECRET');
export const SENDGRID_API_KEY = getEnv('SENDGRID_API_KEY')!;
export const PASSAGE_APP_ID = getEnv('PASSAGE_APP_ID')!;
export const PASSAGE_API_KEY = getEnv('PASSAGE_API_KEY')!;
export const CLIENT_URL = getEnv('CLIENT_URL')!;
export const LOGDROP_API_KEY = getEnv('LOGDROP_API_KEY')!;
export const MAIL_SMTP = getEnv('MAIL_SMTP')!;
export const MAIL_PORT = getEnv('MAIL_PORT')!;
export const MAIL_PASSWORD = getEnv('MAIL_PASSWORD')!;
export const MAIL_USER = getEnv('MAIL_USER')!;

// export const STORAGE_KEY = getEnv("STORAGE_KEY")!;
