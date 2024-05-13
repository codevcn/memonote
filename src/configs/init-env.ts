import { ConfigModule } from '@nestjs/config'

export const iniEnv = () => {
    return ConfigModule.forRoot({
        envFilePath: ['.env', '.env.development'],
    })
}
