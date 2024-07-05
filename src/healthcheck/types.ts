import type { EServerStatuses } from './enums'

export type THealthcheckRes = {
    status: EServerStatuses
    message: string
}
