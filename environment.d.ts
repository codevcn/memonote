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
            DEEPGRAM_API_KEY: string
        }
    }

    type TUnknownFunction<R> = (...args: any[]) => R

    type TUnknownObject<P = number | string> = {
        [key: P]: any
    }
}

export {}
