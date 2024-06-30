import path from 'path'

export class Helpers {
    public static generateRandomString(strLength: number): string {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''

        for (let i = 0; i < strLength; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length)
            result += charset[randomIndex]
        }

        return result
    }

    public static extractNoteUniqueNameFromURL(url: string): string {
        return path.basename(new URL(url).pathname)
    }

    public static logToConsoleWithLocation(...val: any): void {
        console.log('>>> __dirname >>>', require.main?.filename)
        // const print = new Error().stack?.split('\n')[2].trim().split(` (${my_location_src}`)
        // console.log(
        //     '>>>',
        //     print && print[1] ? print[1].slice(0, print[1].length - 1) : '',
        //     '>>>',
        //     ...val,
        // )
    }
}
