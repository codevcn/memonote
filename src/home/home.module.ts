import { Module } from '@nestjs/common'
import { HomeController } from './home.controller'
import { NoteModule } from '@/note/note.module'
import { ApplicationService } from '@/utils/application/application.service'
import { AuthModule } from '@/auth/auth.module'

@Module({
    imports: [NoteModule, AuthModule],
    controllers: [HomeController],
    providers: [ApplicationService],
})
export class HomeModule {}
