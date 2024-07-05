import { Injectable } from '@nestjs/common'
import { EServerStatuses } from './enums'
import type { THealthcheckRes } from './types'

@Injectable()
export class HealthcheckService {
    async checkServerAlive(): Promise<THealthcheckRes> {
        return {
            status: EServerStatuses.ALIVE,
            message: `A healthcheck reponse from MemoNote Server - ${EServerStatuses.ALIVE}`,
        }
    }
}
