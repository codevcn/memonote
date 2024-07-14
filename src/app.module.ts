import { Module } from '@nestjs/common'
import { HomeModule } from './home/home.module'
import { connectToDB, DBModelsModule } from './configs/init-db'
import { iniEnv } from './configs/init-env'
import { configJWT } from './configs/config-jwt'
import { NoteModule } from './note/note.module'
import { AuthModule } from './auth/auth.module'
import { NotificationModule } from './notification/notification.module'
import { initEventEmitter } from './configs/event-emitter'
import { HealthcheckModule } from './healthcheck/healthcheck.module'
// import { I18nConfigModule } from './configs/init-i18n'

@Module({
    imports: [
        iniEnv(),
        connectToDB(),
        configJWT(),
        DBModelsModule,
        // I18nConfigModule,
        HomeModule,
        NoteModule,
        AuthModule,
        NotificationModule,
        initEventEmitter(),
        HealthcheckModule,
    ],
})
export class AppModule {}
