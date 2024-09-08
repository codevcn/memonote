export enum ENotificationTypes {
    SET_PASSWORD = 'password.set',
    REMOVE_PASSWORD = 'password.remove',
    CREATE_NEW_NOTE = 'note.create',
}

export enum EPagination {
    MAX_NOTIFS_PER_PAGE = 7,
}

export enum ENotificationEvents {
    NOTIFY = 'notify',
}

export enum EEventEmitterEvents {
    TRIGGER_NOTIFY = 'trigger_notify',
}
