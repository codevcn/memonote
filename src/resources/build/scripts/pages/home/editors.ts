class EditorsController {
    private static switchedToRichEditor: boolean = false

    private static readonly noteEditorBoard = homePage_pageMain.querySelector(
        '.note-form .note-editor-board',
    ) as HTMLElement

    static setProgressOnSwitching(loading: boolean): void {
        const editorsProgress = document.querySelector(
            '#settings-form-editors .form-content .editors .progress',
        ) as HTMLElement
        editorsProgress.classList.remove('active')
        if (loading) {
            editorsProgress.classList.add('active')
        }
    }

    static setEditors(editor?: EEditors): void {
        const noteContainers =
            this.noteEditorBoard.querySelectorAll<HTMLElement>('.note-editor-container')
        for (const noteContainer of noteContainers) {
            noteContainer.classList.remove('active')
        }

        const settingsEditorItems = document.querySelectorAll<HTMLElement>(
            '#settings-form-editors .form-content .editors .editor',
        )
        for (const editorItem of settingsEditorItems) {
            editorItem.classList.remove('picked')
        }

        if (editor) {
            this.noteEditorBoard
                .querySelector(`.note-editor-container.${editor}-editor`)!
                .classList.add('active')
            document
                .querySelector(`#settings-form-editors .form-content .editors .editor.${editor}`)!
                .classList.add('picked')
        }

        if (editor === EEditors.RICH && !this.switchedToRichEditor) {
            const { placeholder } = pageData.initRichEditorData
            RichEditorController.connectRichEditor({ lang: pageData.currentLang, placeholder })
            this.switchedToRichEditor = true
        }
    }

    static async switchEditorsHandler(editor: EEditors): Promise<void> {
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
            this.setEditors(editor)
        }
        this.setProgressOnSwitching(false)
    }
}

type TConnectRichEditorOptions = {
    lang: ELangCodes
    placeholder: string
}

class RichEditorController {
    static connectRichEditor(config: TConnectRichEditorOptions): void {
        const initConfig = {
            selector: 'textarea#mmn-rich-note-editor',
            plugins: 'link lists table wordcount linkchecker preview',
            placeholder: config.placeholder,
            toolbar:
                'undo redo | blocks fontfamily fontsize forecolor backcolor | bold italic underline strikethrough | link table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
            skin: 'bootstrap',
            language: config.lang,
            height: '500px',
            menubar: false,
            elementpath: false,
        }

        tinymce.init(initConfig)
    }

    static setEditorModes(btnTarget: HTMLElement): void {
        if (btnTarget.classList.contains('active')) return

        const mode = btnTarget.getAttribute('data-mmn-editor-mode') as EEditorModes
        const content = tinymce.get('mmn-rich-note-editor').getContent() as string

        const viewModeContainer = document.getElementById('rich-editor-view-mode')!
        viewModeContainer.innerHTML = content
        viewModeContainer.classList.remove('active')
        EditorsController.setEditors()
        if (mode === EEditorModes.EDIT_MODE) {
            EditorsController.setEditors(EEditors.RICH)
        } else if (mode === EEditorModes.VIEW_MODE) {
            viewModeContainer.classList.add('active')
        }
    }
}

const initEditors = (): void => {
    const { editor } = pageData
    if (editor) {
        EditorsController.setEditors(editor as EEditors)
    }

    // setup "actions"
    const actionBtns = homePage_pageMain.querySelectorAll<HTMLElement>(
        '#rich-editor-edit-mode .actions .action',
    )
    for (const actionBtn of actionBtns) {
        actionBtn.addEventListener('click', function (e) {
            RichEditorController.setEditorModes(actionBtn)
        })
    }
}
initEditors()
