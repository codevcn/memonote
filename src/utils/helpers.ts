import path from 'path'

export const generateRandomString = (strLength: number) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    for (let i = 0; i < strLength; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        result += charset[randomIndex]
    }

    return result
}

export const extractNoteUniqueNameFromURL = (url: string): string => {
    return path.basename(new URL(url).pathname)
}

export const logToConsoleWithLocation = (...val: any) => {
    console.log('>>> __dirname >>>', require.main?.filename)
    // const print = new Error().stack?.split('\n')[2].trim().split(` (${my_location_src}`)
    // console.log(
    //     '>>>',
    //     print && print[1] ? print[1].slice(0, print[1].length - 1) : '',
    //     '>>>',
    //     ...val,
    // )
}
