type TObject = {
    [key: string | number]: any
}

export function createClientPageData<T extends TObject>(data: T): T {
    return data
}
