import { Module } from '@nestjs/common'
import { HomeModule } from './home/home.module'
import { configDB, DBModelsModule } from './configs/init-db'
import { configEnv } from './configs/init-env'
import { configJWT } from './configs/config-jwt'
import { NoteModule } from './note/note.module'
import { AuthModule } from './auth/auth.module'
import { NotificationModule } from './notification/notification.module'
import { initEventEmitter } from './configs/event-emitter'
import { HealthcheckModule } from './healthcheck/healthcheck.module'
import { configI18n } from './configs/init-i18n'
import { LangModule } from './lang/lang.module'
import { ArticleModule } from './article/article.module'

@Module({
    imports: [
        configEnv(),
        configDB(),
        configJWT(),
        DBModelsModule,
        configI18n(),
        HomeModule,
        NoteModule,
        AuthModule,
        NotificationModule,
        initEventEmitter(),
        LangModule,
        HealthcheckModule,
        ArticleModule,
    ],
})
export class AppModule {}
