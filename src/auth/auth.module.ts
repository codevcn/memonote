import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JWTService } from './jwt.service'
import { NoteModule } from '@/note/note.module'

@Module({
    imports: [NoteModule],
    providers: [AuthService, JWTService],
    exports: [AuthService, JWTService],
})
export class AuthModule {}
