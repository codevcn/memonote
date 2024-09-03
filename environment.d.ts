declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production'
            PORT: string
            HOSTNAME: string
            DATABASE_URL: string
            COOKIE_JWT_EXPIRES: string
            JWT_SECRET: string
            JWT_MAX_AGE_IN_HOUR: string
            CLIENT_HOST: string
            JWT_AUTH_COOKIE: string
            CLOUDINARY_CLOUDNAME: string
            CLOUDINARY_API_KEY: string
            CLOUDINARY_API_SECRET: string
        }
    }
}

export {}
