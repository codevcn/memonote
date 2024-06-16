import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JWTService } from './jwt.service'
import { NoteModule } from '@/note/note.module'
import { AuthAPIController } from './auth-api.controller'

@Module({
    imports: [NoteModule],
    controllers: [AuthAPIController],
    providers: [AuthService, JWTService],
    exports: [AuthService],
})
export class AuthModule {}
