import { Module } from '@nestjs/common'
import { HomeModule } from './home/home.module.js'
import { configDB, DBModelsModule } from './configs/init-db.js'
import { configEnv } from './configs/init-env.js'
import { configJWT } from './configs/config-jwt.js'
import { NoteModule } from './note/note.module.js'
import { AuthModule } from './auth/auth.module.js'
import { NotificationModule } from './notification/notification.module.js'
import { initEventEmitter } from './configs/event-emitter.js'
import { HealthcheckModule } from './healthcheck/healthcheck.module.js'
import { configI18n } from './configs/init-i18n.js'
import { LangModule } from './lang/lang.module.js'
import { ArticleModule } from './article/article.module.js'
import { ToolsModule } from './tools/tools.module.js'

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
        ToolsModule,
    ],
})
export class AppModule {}
