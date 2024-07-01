declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production'
            PORT: string
            DATABASE_URL: string
            COOKIE_JWT_EXPIRES: string
            JWT_SECRET: string
            JWT_MAX_AGE_IN_HOUR: string
            CLIENT_HOST: string
            APPLICATION_DOMAIN_DEV: string
            APPLICATION_DOMAIN: string
            JWT_AUTH_COOKIE: string
        }
    }
}

export {}
