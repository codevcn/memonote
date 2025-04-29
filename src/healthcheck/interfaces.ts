import type { CheckAliveQueryDTO } from './DTOs.js'
import type { THealthcheckRes } from './types.js'

export interface IHealthcheckController {
    checkServerAlive: (query: CheckAliveQueryDTO) => Promise<THealthcheckRes>
}
