import type { GatewayMetadata } from '@nestjs/websockets'
import bytes from 'bytes'

const gatewayMetadata: GatewayMetadata = {
    maxHttpBufferSize: bytes('5MB'),
}

export const initGatewayMetadata = (metadata: GatewayMetadata) => ({
    ...gatewayMetadata,
    ...metadata,
})
