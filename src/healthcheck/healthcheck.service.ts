import { Injectable } from '@nestjs/common'
import { EServerStatuses } from './constants.js'
import type { THealthcheckRes } from './types.js'

@Injectable()
export class HealthcheckService {
    async checkServerAlive(holder?: string): Promise<THealthcheckRes> {
        let input: string = 'code vcn'

        if (holder) {
            input = holder
        }

        function randomToggleCase(input: string): string {
            const indices = Array.from(input.toLowerCase())
                .map((char, index) => (/[a-zA-Z]/.test(char) ? index : -1))
                .filter((index) => index !== -1)

            if (indices.length === 0) {
                return input
            }

            const randomIndex = indices[Math.floor(Math.random() * indices.length)]
            const chars = input.split('')

            const char = chars[randomIndex]
            if (char === char.toUpperCase()) {
                chars[randomIndex] = char.toLowerCase()
            } else {
                chars[randomIndex] = char.toUpperCase()
            }

            return chars.join('')
        }

        return {
            status: EServerStatuses.ALIVE,
            message: `A healthcheck reponse from MemoNote Server - ${randomToggleCase(input)}`,
        }
    }
}
