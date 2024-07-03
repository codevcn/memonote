import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import { AuthService } from '@/auth/auth.service'

@Injectable()
export class APIAuthGuard implements CanActivate {
    constructor(private authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>()
        await this.authService.checkAuthentication(request)
        return true
    }
}
