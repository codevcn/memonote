export class BaseCustomEvent<T> {
    constructor(
        public payload: T,
        public noteUniqueName: string,
    ) {}
}
