import { EArticleFiles } from '@/article/enums'
import type { GatewayMetadata } from '@nestjs/websockets'

const gatewayMetadata: GatewayMetadata = {
    maxHttpBufferSize: EArticleFiles.MAX_IMAGE_SIZE,
}

export const initGatewayMetadata = (metadata: GatewayMetadata) => ({
    ...gatewayMetadata,
    ...metadata,
})
