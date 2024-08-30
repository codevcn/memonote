import { bufferToArrayBuffer } from '@/utils/helpers'

export const transformImageData = (img: any) => {
    if (img instanceof Buffer) {
        return bufferToArrayBuffer(img)
    }
    return img
}
