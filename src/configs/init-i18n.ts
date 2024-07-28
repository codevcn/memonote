import * as path from 'path'
import { AcceptLanguageResolver, CookieResolver, I18nJsonLoader, I18nModule } from 'nestjs-i18n'

export const configI18n = () => {
    return I18nModule.forRoot({
        fallbackLanguage: 'en',
        fallbacks: {
            vi: 'vi',
        },
        loaderOptions: {
            path: path.join(__dirname, '../lang/i18n/'),
            watch: true,
        },
        resolvers: [new CookieResolver(['lang']), AcceptLanguageResolver],
        viewEngine: 'ejs',
        typesOutputPath: path.join(__dirname, '../lang/i18n.generated.ts'),
        loader: I18nJsonLoader,
    })
}
