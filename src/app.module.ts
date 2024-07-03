import { Module } from '@nestjs/common'
import { HomeModule } from './home/home.module'
import { connectToDB } from './configs/connect-to-db'
import { iniEnv } from './configs/init-env'
import { configJWT } from './configs/config-jwt'
import { NoteModule } from './note/note.module'
import { AuthModule } from './auth/auth.module'
import { NotificationModule } from './notification/notification.module'

@Module({
    imports: [
        iniEnv(),
        connectToDB(),
        configJWT(),
        HomeModule,
        NoteModule,
        AuthModule,
        NotificationModule,
    ],
})
export class AppModule {}
