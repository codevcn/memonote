import { Module } from '@nestjs/common'
import { LangController } from './lang-api.controller.js'
import { LangService } from './lang.service.js'

@Module({
    controllers: [LangController],
    providers: [LangService],
    exports: [LangService],
})
export class LangModule {}
