import { Module } from '@nestjs/common'
import { HomeModule } from './home/home.module'
import { connectToDB } from './configs/connect-to-db'
import { iniEnv } from './configs/init-env'
import { configJWT } from './configs/config-jwt'

@Module({
    imports: [iniEnv(), connectToDB(), configJWT(), HomeModule],
})
export class AppModule {}
