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

    /**
     * Editors switcher, change UI of editors
     * @param editor editor which switch to
     */
    static setEditors(editor: EEditors): void {
        const noteContainers =
            this.noteEditorBoard.querySelectorAll<HTMLElement>('.note-editor-section')
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
                .querySelector(`.note-editor-section.${editor}-editor`)!
                .classList.add('active')
            document
                .querySelector(`#settings-form-editors .form-content .editors .editor.${editor}`)!
                .classList.add('picked')
        }

        const publishArticleBtn = document.getElementById(
            'publish-article-submit-btn',
        ) as HTMLElement
        if (editor === EEditors.RICH) {
            publishArticleBtn.classList.add('active')

            if (!this.switchedToRichEditor) {
                this.switchedToRichEditor = true
                RichEditorController.connect()
            }
        } else if (editor === EEditors.NORMAL) {
            publishArticleBtn.classList.remove('active')
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

const initEditors = (): void => {
    const { editor } = pageData
    if (editor) {
        EditorsController.setEditors(editor as EEditors)
    } else {
        EditorsController.setEditors(EEditors.NORMAL)
    }

    // setup "actions"
    const actions = homePage_pageMain.querySelectorAll<HTMLElement>(
        '#rich-editor-section .actions .action-btn',
    )
    for (const actionBtn of actions) {
        actionBtn.addEventListener('click', function (e) {
            RichEditorController.switchEditorModes(actionBtn)
        })
    }
}
initEditors()
