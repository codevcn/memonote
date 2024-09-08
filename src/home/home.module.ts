import { Module } from '@nestjs/common'
import { HomeController } from './home.controller.js'
import { NoteModule } from '../note/note.module.js'
import { AuthModule } from '../auth/auth.module.js'
import { LangModule } from '../lang/lang.module.js'

@Module({
    imports: [NoteModule, AuthModule, LangModule],
    controllers: [HomeController],
})
export class HomeModule {}
