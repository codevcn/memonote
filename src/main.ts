// require('module-alias/register')

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { HttpExceptionFilter } from './utils/exception/http-exception.filter.js'
import { HttpExceptionValidation } from './utils/validation/http-exception.validation.js'
import cookieParser from 'cookie-parser'
import { WsExceptionsFilter } from './utils/exception/gateway.filter.js'
import { apiValidationPipe } from './configs/config-validation.js'
import AppRootPath from 'app-root-path'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    const { PORT, HOSTNAME } = process.env

    // cookie
    app.use(cookieParser())

    // ejs
    const resourcesDir = 'resources'
    app.useStaticAssets(join(AppRootPath.path, `/src/${resourcesDir}/public`))
    app.setBaseViewsDir(join(AppRootPath.path, `/src/${resourcesDir}/views`))
    app.setViewEngine('ejs')

    // validation
    app.useGlobalPipes(apiValidationPipe)

    // exception filter
    app.useGlobalFilters(new HttpExceptionFilter(new HttpExceptionValidation()))

    await app.listen(PORT || 8080, HOSTNAME || '0.0.0.0')
    console.log(`>>> Server is working on port: ${PORT}`)
}
bootstrap()
