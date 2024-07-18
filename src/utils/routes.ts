export class ViewRoutes {
    static readonly home: string = '/'
    static readonly auth: string = '/auth'
}

export class APIRoutes {
    private static readonly apiRootPath: string = 'v1/api'

    static readonly note: string = `${this.apiRootPath}/note`
    static readonly auth: string = `${this.apiRootPath}/auth`
    static readonly notification: string = `${this.apiRootPath}/notification`
    static readonly healthcheck: string = `${this.apiRootPath}/healthcheck`
    static readonly lang: string = `${this.apiRootPath}/lang`
}
