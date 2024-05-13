import { JwtModule } from '@nestjs/jwt'
import ms from 'ms'

export const configJWT = () => {
    return JwtModule.register({
        global: true,
        secret: process.env.JWT_SECRET,
        signOptions: {
            expiresIn: ms(process.env.COOKIE_JWT_EXPIRES),
        },
    })
}
