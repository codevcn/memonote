import moment from 'moment'

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

type TObject = {
    [key: string | number]: any
}

export function createServerData<T extends TObject>(serverData: T): T {
    return serverData
}

export const isValidISO8601 = (dateString: string): boolean => {
    return moment(dateString, moment.ISO_8601, true).isValid()
}
