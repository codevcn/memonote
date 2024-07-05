export class ClientViewPages {
    private static readonly rootPath: string = 'pages'

    static readonly home: string = `${this.rootPath}/home/home-page`
    static readonly signIn: string = `${this.rootPath}/auth/sign-in-page`
    static readonly error: string = `${this.rootPath}/error/error-page`
    static readonly page404: string = `${this.rootPath}/error/404-page`
    static readonly about: string = `${this.rootPath}/about/about-page`
}
