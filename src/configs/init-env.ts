import { ConfigModule } from '@nestjs/config'

export const configEnv = () => {
    return ConfigModule.forRoot({
        envFilePath: ['.env', '.env.development'],
    })
}
