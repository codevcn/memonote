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
     * Editors switcher
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

        if (editor === EEditors.RICH && !this.switchedToRichEditor) {
            const { placeholder } = pageData.richEditorData
            RichEditorController.connect({ lang: pageData.currentLang, placeholder })
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
    private static readonly richEditorId: string = 'mmn-rich-note-editor'

    static connect(config: TConnectRichEditorOptions): void {
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

    static setEditModeContent(content: string): void {
        // tinymce.get(this.richEditorId).setContent(content)
    }

    static setViewModeContent(content: string, editor: HTMLElement): void {
        editor.innerHTML = content
    }

    /**
     * Rich editor modes switcher
     * @param btnTarget html target with an attribute "data-" contains a mode
     */
    static setEditorModes(btnTarget: HTMLElement): void {
        if (btnTarget.classList.contains('active')) return

        const mode = btnTarget.getAttribute('data-mmn-editor-mode') as EEditorModes
        const content = tinymce.get(this.richEditorId).getContent() as string

        const actions = btnTarget.closest('.actions')!.querySelectorAll<HTMLElement>('.action-btn')
        for (const actionBtn of actions) {
            actionBtn.classList.remove('active')
        }
        btnTarget.classList.add('active')

        const viewModeSection = document.querySelector(
            '#rich-editor-section .rich-editor-mode.view-mode',
        ) as HTMLElement
        this.setViewModeContent(content, viewModeSection)
        viewModeSection.classList.remove('active')

        const editModeSection = document.querySelector(
            '#rich-editor-section .rich-editor-mode.edit-mode',
        ) as HTMLElement
        editModeSection.classList.remove('active')

        if (mode === EEditorModes.EDIT_MODE) {
            editModeSection.classList.add('active')
        } else if (mode === EEditorModes.VIEW_MODE) {
            viewModeSection.classList.add('active')
        }
    }

    private static validateNoteContent(noteContent: string): boolean {
        let isValid: boolean = true
        if (!noteContent) {
            isValid = false
            LayoutController.toast('error', 'Do not empty your note')
        }
        return isValid
    }

    static async publishArticleHandler(target: HTMLElement): Promise<void> {
        const noteContent = tinymce.get(this.richEditorId).getContent()
        if (this.validateNoteContent(noteContent)) {
            const htmlBefore = target.innerHTML
            target.innerHTML = Materials.createHTMLLoading('border')
            try {
                await this.publishArticle(noteContent)
            } catch (error) {
                if (error instanceof Error) {
                    LayoutController.toast('error', error.message)
                }
            }
            target.innerHTML = htmlBefore
        }
    }

    static async publishArticle(noteContent: string): Promise<void> {
        const chunks = convertStringToChunks(noteContent, EArticleChunk.SIZE_IN_KB_PER_CHUNK)
        for (const chunk of chunks) {
            await publishArticleInChunks({
                articleChunk: chunk,
                noteId: pageData.noteId,
                noteUniqueName: getNoteUniqueNameFromURL(),
                totalChunks: chunks.length,
            })
        }
    }
}

const initEditors = (): void => {
    const { editor, richEditorData } = pageData
    if (editor && richEditorData) {
        EditorsController.setEditors(editor as EEditors)
        RichEditorController.setEditModeContent(richEditorData.content)
    } else {
        EditorsController.setEditors(EEditors.NORMAL)
    }

    // setup "actions"
    const actions = homePage_pageMain.querySelectorAll<HTMLElement>(
        '#rich-editor-section .actions .action-btn',
    )
    for (const actionBtn of actions) {
        actionBtn.addEventListener('click', function (e) {
            RichEditorController.setEditorModes(actionBtn)
        })
    }
}
initEditors()
