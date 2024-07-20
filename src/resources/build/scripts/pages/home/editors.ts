class EditorsController {
    static setProgressOnSwitching(loading: boolean): void {
        const editorsProgress = document.querySelector(
            '#settings-form-editors .form-content .editors .progress',
        ) as HTMLElement
        editorsProgress.classList.remove('active')
        if (loading) {
            editorsProgress.classList.add('active')
        }
    }

    static setUIOfEditors(editor: EEditors): void {
        const noteContainers = homePage_pageMain.querySelectorAll<HTMLElement>(
            '.notes .note-form .note-editor-board .note-editor-container',
        )
        for (const noteContainer of noteContainers) {
            noteContainer.classList.remove('active')
        }
        homePage_pageMain
            .querySelector(
                `.notes .note-form .note-editor-board .note-editor-container.${editor}-editor`,
            )!
            .classList.add('active')

        const settingsEditors = document.querySelectorAll<HTMLElement>(
            '#settings-form-editors .form-content .editors .editor',
        )
        for (const editor of settingsEditors) {
            editor.classList.remove('picked')
        }
        document
            .querySelector(`#settings-form-editors .form-content .editors .editor.${editor}`)!
            .classList.add('picked')

        if (editor === EEditors.RICH) {
            RichEditorController.connectRichEditor()
        }
    }

    static async switchEditorHandler(editor: EEditors): Promise<void> {
        const noteUniqueName = getNoteUniqueNameFromURL()
        let apiSuccess: boolean = false
        this.setProgressOnSwitching(true)
        try {
            await switchEditorAPI(noteUniqueName, editor)
            apiSuccess = true
        } catch (error) {
            if (error instanceof Error) {
                LayoutController.toast('error', error.message)
            }
        }
        if (apiSuccess) {
            this.setUIOfEditors(editor)
        }
        this.setProgressOnSwitching(false)
    }
}

type TRichEditorInitData = {
    placeholder: string
}

class RichEditorController {
    static connectRichEditor(): void {
        const initData = pageData.initRichEditorData

        const config = {
            selector: 'textarea#mmn-rich-note-editor',
            plugins: 'link lists table wordcount linkchecker',
            placeholder: initData.placeholder,
            toolbar:
                'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
            skin: 'bootstrap',
            menubar: false,
        }

        tinymce.init(config)
    }
}

const initEditors = () => {
    const editor = pageData.editor
    console.log('>>> edtor >>>', { editor })
    if (editor) {
        EditorsController.setUIOfEditors(editor as EEditors)
    }
}
initEditors()
