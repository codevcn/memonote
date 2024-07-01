import ms from 'ms'

export class UserSessions {
    private static readonly authUserSessions: Map<string, string[]> = new Map()

    private static removeSessionWithTimer(noteUniqueName: string, token: string): void {
        setTimeout(() => {
            this.removeUserSession(noteUniqueName, token)
        }, ms(process.env.JWT_MAX_AGE_IN_HOUR))
    }

    static checkNote(noteUniqueName: string): boolean {
        return this.authUserSessions.has(noteUniqueName)
    }

    static addUserSession(noteUniqueName: string, token: string): void {
        const users = this.authUserSessions.get(noteUniqueName)
        if (users && users.length > 0) {
            if (!users.includes(token)) {
                this.authUserSessions.set(noteUniqueName, [...users, token])
            }
        } else {
            this.authUserSessions.set(noteUniqueName, [token])
        }
        this.removeSessionWithTimer(noteUniqueName, token)
    }

    static removeUserSession(noteUniqueName: string, token: string): void {
        const users = this.authUserSessions.get(noteUniqueName)
        if (users && users.length > 0) {
            const newUsers = users.filter((authToken) => authToken !== token)
            this.authUserSessions.set(noteUniqueName, newUsers)
            if (newUsers.length === 0) {
                this.authUserSessions.delete(noteUniqueName)
            }
        }
    }

    static checkUserSessionIfExists(noteUniqueName: string, token: string): boolean {
        const users = this.authUserSessions.get(noteUniqueName)
        if (users && users.length > 0) {
            return users.some((authToken) => authToken === token)
        }
        return false
    }

    static logoutUserSessions(noteUniqueName: string, exceptToken: string): void {
        const users = this.authUserSessions.get(noteUniqueName)
        if (users && users.length > 0) {
            this.authUserSessions.set(
                noteUniqueName,
                users.filter((authToken) => authToken === exceptToken),
            )
        }
    }
}
