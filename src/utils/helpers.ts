export function logToConsoleWithLocation(...val: any): void {
    console.log('>>> __dirname >>>', require.main?.filename)
    // const print = new Error().stack?.split('\n')[2].trim().split(` (${my_location_src}`)
    // console.log(
    //     '>>>',
    //     print && print[1] ? print[1].slice(0, print[1].length - 1) : '',
    //     '>>>',
    //     ...val,
    // )
}

export function createServerData<T extends { [key: string | number]: any }>(serverData: T): T {
    return serverData
}
