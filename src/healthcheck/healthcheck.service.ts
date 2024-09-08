import { Injectable } from '@nestjs/common'
import { EServerStatuses } from './constants.js'
import type { THealthcheckRes } from './types.js'

@Injectable()
export class HealthcheckService {
    async checkServerAlive(): Promise<THealthcheckRes> {
        return {
            status: EServerStatuses.ALIVE,
            message: `A healthcheck reponse from MemoNote Server - ${EServerStatuses.ALIVE}`,
        }
    }
}
