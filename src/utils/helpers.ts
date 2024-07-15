import moment from 'moment'

type TObject = {
    [key: string | number]: any
}

export function createServerData<T extends TObject>(serverData: T): T {
    return serverData
}

export const isValidISO8601 = (dateString: string): boolean => {
    return moment(dateString, moment.ISO_8601, true).isValid()
}

export function isEnumValue<T extends Object>(value: any, enumObj: T): value is T[keyof T] {
    return Object.values(enumObj).includes(value)
}
