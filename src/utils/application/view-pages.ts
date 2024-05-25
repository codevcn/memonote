export class ClientViewPages {
    private static rootPath: string = 'pages'

    static home: string = `${this.rootPath}/home/home-page`
    static signIn: string = `${this.rootPath}/auth/sign-in-page`
    static error: string = `${this.rootPath}/error/error-page`
    static page404: string = `${this.rootPath}/error/404-page`
    static about: string = `${this.rootPath}/about/about-page`
}
