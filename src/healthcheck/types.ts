import type { EServerStatuses } from './constants.js'

export type THealthcheckRes = {
    status: EServerStatuses
    message: string
}
