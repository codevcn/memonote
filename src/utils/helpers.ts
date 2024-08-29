type TObject = {
    [key: string | number]: any
}

export function createClientPageData<T extends TObject>(data: T): T {
    return data
}

export function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
    const arrayBuffer = new ArrayBuffer(buffer.length)
    const view = new Uint8Array(arrayBuffer)
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i]
    }
    return arrayBuffer
}
