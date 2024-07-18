type TObject = {
    [key: string | number]: any
}

export function createServerData<T extends TObject>(serverData: T): T {
    return serverData
}
