interface ILayoutUITrans {
    Realtime_Mode: string
    Notifications: string
    Close_notifications: string
    Notifications_tooltip: string
    About_Us: string
    FAQ: string
    All: string
    New: string
    Empty_notification: string
    Load_more: string
    Empty_new_notification: string
}

interface INotificationDataTrans {
    type: {
        Set_password: string
        Remove_password: string
        Create_new_note: string
    }
    message: {
        Set_password: string
        Remove_password: string
        Create_new_note: string
    }
    createdAt: string
    timeUnits: {
        year: string
        month: string
        day: string
        hour: string
        minute: string
        seconds: string
    }
}

interface ISettings {
    Settings: string
    changeModes: IChangeModesSettings
    password: IPasswordSettings
    userInterface: IUserInterfaceSettings
    language: ILanguagesSettings
    Logout: string
    Save_Changes: string
    Submit: string
    Saved: string
    Unsaved: string
    Close: string
    Confirm: string
}

interface IChangeModesSettings {
    Change_Modes: string
    Realtime_mode_tooltip: string
    Notify_edited_tooltip: string
    Night_mode_tooltip: string
    Realtime_mode_label: string
    Notify_edited_label: string
    Night_mode_label: string
}

interface IPasswordSettings {
    Password: string
    Password_has_been_set: string
    Logout_all_users_tooltip: string
    Add_Or_Change_Password: string
    Remove_Password: string
    Add_Or_Change_Password_title: string
    Add_Or_Change_Password_helper_text: string
    Logout_all_users: string
    Remove_Password_title: string
    Remove_Password_confirm: string
    Unset_password: string
    Change_Password: string
    Add_Password: string
    Enter_password_here: string
}

interface IUserInterfaceSettings {
    User_Interface: string
    User_Interface_title: string
    Notify_edited_styling_title: string
    Blink: string
    Slither: string
    Notify_edited_styling_tooltip: string
    Change_text_font_title: string
    Change_text_font_tooltip: string
}

interface INoteForm {
    Note_annotation_Title: string
    Note_annotation_Author: string
    Note_annotation_Content: string
}

interface ILanguagesSettings {
    Title_placeholder: string
    Author_placeholder: string
    Content_placeholder: string
    Language: string
    Change_language_label: string
    Change_language_tootlip: string
    Vietnamese: string
    English: string
    langs: string[]
}

interface IHomePageUITrans {
    Scroll_to_top: string
    settings: ISettings
    noteForm: INoteForm
}

// UI (client side, ...)
export interface IUII18nTranslations {
    layout: ILayoutUITrans
    'home-page': IHomePageUITrans
}
// Data (database, ...)
export interface IDataI18nTranslations {
    notification: INotificationDataTrans
}
