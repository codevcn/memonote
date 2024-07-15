import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { ValidationPipe } from '@nestjs/common'
import { HttpExceptionFilter } from './utils/exception/http-exception.filter'
import { HttpExceptionValidation } from './utils/validation/http-exception.validation'
import cookieParser from 'cookie-parser'

const resourcesFolder = 'resources'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    const PORT = process.env.PORT

    // cookie
    app.use(cookieParser())

    // ejs
    app.useStaticAssets(join(__dirname, `../src/${resourcesFolder}/public`))
    app.setBaseViewsDir(join(__dirname, `../src/${resourcesFolder}/views`))
    app.setViewEngine('ejs')

    // validation
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    )

    // exception filter
    app.useGlobalFilters(new HttpExceptionFilter(new HttpExceptionValidation()))

    await app.listen(PORT)
    console.log('>>> Server is working on http://localhost:' + PORT)
}
bootstrap()
