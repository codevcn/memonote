export class ViewRoutes {
    static home: string = '/'
    static auth: string = '/auth'
}

export class APIRoutes {
    private static apiRootPath: string = 'v1/api'

    static note: string = `${this.apiRootPath}/note`
    static auth: string = `${this.apiRootPath}/auth`
    static notification: string = `${this.apiRootPath}/noti`
}
