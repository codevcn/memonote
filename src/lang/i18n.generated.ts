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

interface IHomePageUITrans {
    Scroll_to_top: string
    settings: {
        Settings: string
        changeModes: {
            Change_Modes: string
            Realtime_mode_tooltip: string
            Notify_edited_tooltip: string
            Night_mode_tooltip: string
            Realtime_mode_label: string
            Notify_edited_label: string
            Night_mode_label: string
        }
        password: {
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
        userInterface: {
            User_Interface: string
            User_Interface_title: string
            Notify_edited_styling_title: string
            Blink: string
            Slither: string
            Notify_edited_styling_tooltip: string
            Change_text_font_title: string
            Change_text_font_tooltip: string
            Nav_bar_position: string
            Nav_bar_position_tooltip: string
            navBaPositions: {
                sticky: string
                static: string
            }
        }
        language: {
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
        editors: {
            Notice_text: string
            Editors: string
            Switch_editor: string
            Pick_an_editor: string
            Click_for_more_details: string
            Picked: string
        }
        Logout: string
        Save_Changes: string
        Submit: string
        Saved: string
        Unsaved: string
        Close: string
        Confirm: string
    }
    noteForm: {
        Note_annotation_Title: string
        Note_annotation_Author: string
        Note_annotation_Content: string
        richEditor: {
            View_mode: string
            Edit_mode: string
            Enter_height: string
        }
    }
}

interface ISigInPageUITrans {
    Enter_password: string
    Submit: string
}

// UI (client side, ...)
export interface IUII18nTranslations {
    layout: ILayoutUITrans
    'home-page': IHomePageUITrans
    'signin-page': ISigInPageUITrans
}
// Data (database, ...)
export interface IDataI18nTranslations {
    notification: INotificationDataTrans
}
