import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

type TObject = {
    [key: string | number]: any
}

export function createClientPageData<T extends TObject>(data: T): T {
    return data
}

export async function validateJson<T>(jsonData: any, classType: ClassConstructor<T>): Promise<T> {
    const classInstance = plainToInstance(classType, jsonData)
    const errors = await validate(classInstance as object)
    if (errors.length > 0) {
        throw errors
    }
    return classInstance
}
