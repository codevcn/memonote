import { Module } from '@nestjs/common'
import { HomeController } from './home.controller'
import { NoteModule } from '@/note/note.module'
import { AuthModule } from '@/auth/auth.module'

@Module({
    imports: [NoteModule, AuthModule],
    controllers: [HomeController],
})
export class HomeModule {}
