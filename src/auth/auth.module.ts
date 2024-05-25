import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JWTService } from './jwt.service'
import { NoteModule } from '@/note/note.module'
import { AuthAPIController } from './api/auth-api.controller'
import { AuthController } from './auth.controller'
import { ApplicationService } from '@/utils/application/application.service'

@Module({
    imports: [NoteModule],
    controllers: [AuthController, AuthAPIController],
    providers: [AuthService, JWTService, ApplicationService],
    exports: [AuthService],
})
export class AuthModule {}
