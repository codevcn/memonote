import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { ValidationPipe } from '@nestjs/common'

const resourcesFolder = 'resources'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    const PORT = process.env.PORT

    // ejs
    app.useStaticAssets(join(__dirname, '..', `src/${resourcesFolder}/public`))
    app.setBaseViewsDir(join(__dirname, '..', `src/${resourcesFolder}/views`))
    app.setViewEngine('ejs')

    // validation
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    )

    await app.listen(PORT)
    console.log('>>> Server is working on http://localhost:' + PORT)
}
bootstrap()
