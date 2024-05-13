export const generateRandomString = (strLength: number) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    for (let i = 0; i < strLength; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        result += charset[randomIndex]
    }

    return result
}
