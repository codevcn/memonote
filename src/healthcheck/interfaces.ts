import type { THealthcheckRes } from './types.js'

export interface IHealthcheckController {
    checkServerAlive: () => Promise<THealthcheckRes>
}
