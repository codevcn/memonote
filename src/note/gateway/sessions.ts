export class BaseSessions {
    static readonly authUserSessions: Map<string, string[]> = new Map()

    static checkNote(noteUniqueName: string): boolean {
        return this.authUserSessions.has(noteUniqueName)
    }

    static addUserSession(noteUniqueName: string, jwt: string): void {
        const users = this.authUserSessions.get(noteUniqueName)
        if (users && users.length > 0) {
            if (!users.includes(jwt)) {
                this.authUserSessions.set(noteUniqueName, [...users, jwt])
            }
        } else {
            this.authUserSessions.set(noteUniqueName, [jwt])
        }
    }

    static removeUserSession(noteUniqueName: string, jwt: string): void {
        const users = this.authUserSessions.get(noteUniqueName)
        if (users && users.length > 0) {
            const newUsers = users.filter((token) => token !== jwt)
            this.authUserSessions.set(noteUniqueName, newUsers)
            if (newUsers.length === 0) {
                this.authUserSessions.delete(noteUniqueName)
            }
        }
    }

    static checkUserSessionIfExists(noteUniqueName: string, jwt: string): boolean {
        const users = this.authUserSessions.get(noteUniqueName)
        if (users && users.length > 0) {
            return users.some((token) => token === jwt)
        }
        return false
    }

    static logoutUserSessions(noteUniqueName: string, exceptionJWT: string): void {
        const users = this.authUserSessions.get(noteUniqueName)
        if (users && users.length > 0) {
            this.authUserSessions.set(
                noteUniqueName,
                users.filter((token) => token === exceptionJWT),
            )
        }
    }
}
