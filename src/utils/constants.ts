import { fileURLToPath } from 'url'
import { dirname } from 'path'

export const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename)

export enum ENodeEnvironments {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
}

export enum ECommonStatuses {
    SUCCESS = 'success',
}

export enum ESocketNamespaces {
    NOTE = 'note',
    NOTIFICATION = 'notification',
    ARTICLE = 'article',
}

export enum EInitialSocketEvents {
    CLIENT_CONNECTED = 'client_connected',
}
