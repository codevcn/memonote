import type { THealthcheckRes } from './types'

export interface IHealthcheckController {
    checkServerAlive: () => Promise<THealthcheckRes>
}
