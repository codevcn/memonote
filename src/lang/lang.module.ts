import { Module } from '@nestjs/common'
import { LangController } from './lang.controller'
import { LangService } from './lang.service'

@Module({
    controllers: [LangController],
    providers: [LangService],
    exports: [LangService],
})
export class LangModule {}
