import { Module } from '@nestjs/common'
import { AuthService } from './auth.service.js'
import { JWTService } from './jwt.service.js'
import { NoteModule } from '../note/note.module.js'
import { AuthAPIController } from './auth-api.controller.js'

@Module({
    imports: [NoteModule],
    controllers: [AuthAPIController],
    providers: [AuthService, JWTService],
    exports: [AuthService],
})
export class AuthModule {}
