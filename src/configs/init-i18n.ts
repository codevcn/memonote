import { Module } from '@nestjs/common'
import * as path from 'path'
import { AcceptLanguageResolver, I18nJsonLoader, I18nModule, QueryResolver } from 'nestjs-i18n'

@Module({
    imports: [
        I18nModule.forRoot({
            fallbackLanguage: 'en',
            loaderOptions: {
                path: path.join(__dirname, '/i18n/'),
                watch: true,
            },
            resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
            viewEngine: 'ejs',
        }),
    ],
    controllers: [],
})
export class I18nConfigModule {}
