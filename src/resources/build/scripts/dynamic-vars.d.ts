declare type TUnknownObject = {
    [key: number | string]: any
}
declare type TUnknownFunction<R> = (...args: any[]) => R
declare const dayjs: any
declare const axios: any
declare function io(...args: any[]): any
declare const bootstrap: any
declare const pageData: { [key: string | number]: any }
declare const tinymce: any
declare const gsap: any
declare class Tesseract {
    static createScheduler(...args: any[]): TUnknownObject
    static createWorker(...args: any[]): Promise<TUnknownObject>
}
