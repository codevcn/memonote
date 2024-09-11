import { Module } from '@nestjs/common'
import { ToolsAPIController } from './tools-api.controller.js'
import { TranscribeAudioService } from './transcribe-audio.service.js'

@Module({
    controllers: [ToolsAPIController],
    providers: [TranscribeAudioService],
})
export class ToolsModule {}
