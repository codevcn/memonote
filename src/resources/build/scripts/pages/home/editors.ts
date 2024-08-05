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

        const publishArticleBtn = document.getElementById(
            'publish-article-submit-btn',
        ) as HTMLElement
        if (editor === EEditors.RICH) {
            publishArticleBtn.classList.add('active')

            if (!this.switchedToRichEditor) {
                const { placeholder } = pageData.richEditorData
                RichEditorController.connect({ lang: pageData.currentLang, placeholder })
                this.switchedToRichEditor = true
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

type TConnectRichEditorOptions = {
    lang: ELangCodes
    placeholder: string
}

class RichEditorController {
    private static readonly richEditorId: string = 'mmn-rich-note-editor'

    static connect(config: TConnectRichEditorOptions): void {
        const initConfig = {
            selector: `textarea#${this.richEditorId}`,
            plugins: 'link lists table wordcount linkchecker preview',
            placeholder: config.placeholder,
            toolbar:
                'undo redo | blocks fontfamily fontsize forecolor backcolor | bold italic underline strikethrough | link table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
            skin: 'bootstrap',
            language: config.lang,
            menubar: false,
            elementpath: false,
            content_css: '/styles/pages/home-page/tinymce.css',
            font_family_formats: `Arial=Arial, Helvetica, sans-serif; 
                Work Sans=Work Sans, Arial, sans-serif;
                Poppins=Poppins, Arial, sans-serif;
                Times New Roman=Times New Roman, Times, serif;
                Roboto=Roboto, Times, serif`,
            min_height: 400,
            height: 400,
            setup: (editor: any) => {
                editor.on('init', (e: Event) => {
                    RichEditorController.fetchArticle()
                    setupScrollToBottom()
                })
            },
        }

        tinymce.init(initConfig)
    }

    private static setArticleContent(content: string): void {
        tinymce.get(this.richEditorId).setContent(content)
    }

    private static getArticleContent(): string {
        return tinymce.get(this.richEditorId).getContent()
    }

    private static setViewModeContent(content: string, editor: HTMLElement): void {
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
        const htmlBefore = target.innerHTML
        this.setLoading(target, true)
        const noteContent = this.getArticleContent()
        if (this.validateNoteContent(noteContent)) {
            try {
                await this.publishArticle(noteContent)
            } catch (error) {
                if (error instanceof Error) {
                    LayoutController.toast('error', error.message)
                }
            }
        }
        this.setLoading(target, false, htmlBefore)
    }

    static async publishArticle(noteContent: string): Promise<void> {
        const chunks = convertStringToChunks(noteContent, EArticleChunk.SIZE_IN_KB_PER_CHUNK)
        const uploadId = crypto.randomUUID()
        await publishArticleInChunks(chunks, {
            noteId: pageData.noteId,
            noteUniqueName: getNoteUniqueNameFromURL(),
            totalChunks: chunks.length,
            uploadId,
        })
        console.log('>>> run this done publish 197')
    }

    private static setLoading(target: HTMLElement, loading: boolean, htmlBefore?: string): void {
        if (loading) {
            target.innerHTML = Materials.createHTMLLoading('border')
            target.classList.add('loading')
        } else if (htmlBefore) {
            target.innerHTML = htmlBefore
            target.classList.remove('loading')
        }
    }

    static async fetchArticle(): Promise<void> {
        const { noteId } = pageData
        let apiResult: Blob
        const publishArticleBtn = document.getElementById(
            'publish-article-submit-btn',
        ) as HTMLElement
        const htmlBefore = publishArticleBtn.innerHTML
        this.setLoading(publishArticleBtn, true)
        try {
            const { data } = await fetchArticleAPI(noteId)
            apiResult = data
        } catch (error) {
            if (error instanceof Error) {
                const err = HTTPErrorHandler.handleError(error)
                LayoutController.toast('error', err.message)
            }
            return
        }
        if (apiResult && apiResult.size > 0) {
            const reader = new FileReader()
            reader.onload = function () {
                const content = reader.result as string
                RichEditorController.setArticleContent(content)
            }
            reader.readAsText(apiResult)
        }
        this.setLoading(publishArticleBtn, false, htmlBefore)
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
            RichEditorController.setEditorModes(actionBtn)
        })
    }
}
initEditors()
