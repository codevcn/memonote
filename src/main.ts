import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { HttpExceptionFilter } from './utils/exception/http-exception.filter'
import { HttpExceptionValidation } from './utils/validation/http-exception.validation'
import cookieParser from 'cookie-parser'
import { WsExceptionsFilter } from './utils/exception/gateway.filter'
import { apiValidationPipe } from './configs/config-validation'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    const { PORT, HOSTNAME } = process.env

    // cookie
    app.use(cookieParser())

    // ejs
    const resourcesFolder = 'resources'
    app.useStaticAssets(join(__dirname, `../src/${resourcesFolder}/public`))
    app.setBaseViewsDir(join(__dirname, `../src/${resourcesFolder}/views`))
    app.setViewEngine('ejs')

    // validation
    app.useGlobalPipes(apiValidationPipe)

    // exception filter
    app.useGlobalFilters(
        new HttpExceptionFilter(new HttpExceptionValidation()),
        new WsExceptionsFilter(),
    )

    await app.listen(PORT || 8080, HOSTNAME || '0.0.0.0')
    console.log(`>>> Server is working on port: ${PORT}`)
}
bootstrap()
