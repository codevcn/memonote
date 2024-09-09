import { Module } from '@nestjs/common'
import { ToolsController } from './tools-api.controller.js'
import { TranscriptAudioService } from './transcribe-audio.service.js'

@Module({
    controllers: [ToolsController],
    providers: [TranscriptAudioService],
})
export class ToolsModule {}
