import { Module } from '@nestjs/common'
import { HomeController } from './home.controller'
import { NoteModule } from '@/note/note.module'
import { AuthModule } from '@/auth/auth.module'
import { LangModule } from '@/lang/lang.module'

@Module({
    imports: [NoteModule, AuthModule, LangModule],
    controllers: [HomeController],
})
export class HomeModule {}
