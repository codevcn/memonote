import { EFileSize } from '@/article/gateway/enums'
import type { GatewayMetadata } from '@nestjs/websockets'

const gatewayMetadata: GatewayMetadata = {
    maxHttpBufferSize: EFileSize.MAX_IMAGE_SIZE,
}

export const initGatewayMetadata = (metadata: GatewayMetadata) => ({
    ...gatewayMetadata,
    ...metadata,
})
