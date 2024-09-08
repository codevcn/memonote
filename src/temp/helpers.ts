type TAsyncExecutor<T> = (...args: any[]) => Promise<T>

export const performAsync = async <T>(executor: TAsyncExecutor<T>, ...args: any[]): Promise<T> => {
    return await executor(...args)
}
