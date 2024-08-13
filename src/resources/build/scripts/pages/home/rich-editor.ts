// init types, enums, ...
enum EArticleEvents {
    PUBLISH_ARTICLE = 'publish_article',
}

type TPublishArticleReturn = TSuccess & {
    message?: string
}

type TPublishArticleInChunksPyld = {
    totalChunks: number
    noteUniqueName: string
    noteId: string
    uploadId: string
}

type TCssForSettingStyleOfEditor = Partial<{
    height: number
}>

// init socket
const richEditorSocket = io(`/${ENamespacesOfSocket.RICH_EDITOR}`, clientSocketConfig)

class RichEditorController {
    private static readonly richEditorId: string = 'mmn-rich-note-editor'
    private static chunkIdx: number = 0
    private static htmlBefore: string = ''
    private static minHeightOfEditor: number = 300

    static async connect(): Promise<void> {
        const { richEditorData, currentLang } = pageData
        const { placeholder } = richEditorData

        const initConfig = {
            selector: `textarea#${this.richEditorId}`,
            plugins: 'link lists table wordcount linkchecker preview save fullscreen',
            placeholder: placeholder,
            toolbar:
                'undo redo | blocks fontfamily fontsize forecolor backcolor | bold italic underline strikethrough | link table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat | fullscreen',
            skin: 'bootstrap',
            language: currentLang,
            menubar: false,
            elementpath: false,
            content_css: '/styles/pages/home-page/tinymce.css',
            font_family_formats: `Arial=Arial, Helvetica, sans-serif; 
                Work Sans=Work Sans, Arial, sans-serif;
                Poppins=Poppins, Arial, sans-serif;
                Times New Roman=Times New Roman, Times, serif;
                Roboto=Roboto, Times, serif`,
            min_height: this.minHeightOfEditor,
            height: this.minHeightOfEditor + 100,
            toolbar_sticky: true,
            mobile: {
                toolbar_mode: 'wrap',
                height: this.minHeightOfEditor + 200,
            },
            setup: (editor: any) => {
                editor.on('init', (e: Event) => {
                    RichEditorController.fetchArticle()
                    setupScrollToBottom()
                })
            },
        }

        tinymce.init(initConfig)
    }

    private static setStyleOfEditor(style: TCssForSettingStyleOfEditor): void {
        const container = tinymce.activeEditor.getContainer() as HTMLElement
        const { height } = style
        if (height) container.style.height = `${style.height}px`
    }

    static setHeightOfEditor(e: KeyboardEvent): void {
        if (e.key === 'Enter') {
            const input = e.target as HTMLInputElement
            const height = parseInt(input.value)
            const messageEle = input
                .closest('.set-editor-height')!
                .querySelector('.message') as HTMLElement
            if (Number.isInteger(height) && height >= this.minHeightOfEditor) {
                this.setStyleOfEditor({ height })
                messageEle.classList.remove('active')
            } else {
                const message = `Enter an integer equal or greater than ${this.minHeightOfEditor}`
                messageEle.classList.add('active')
                messageEle.innerHTML = `
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <span class="content">${message}</span>`
            }
        }
    }

    private static setArticleContent(content: string): void {
        tinymce.activeEditor.setContent(content)
    }

    private static setViewModeContent(content: string, editor: HTMLElement): void {
        editor.innerHTML = content
    }

    private static getRichEditorContent(): Promise<string> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(tinymce.activeEditor.getContent() as string)
            }, 0)
        })
    }

    /**
     * Rich editor modes switcher
     * @param target html target with an attribute "data-" contains a mode
     */
    static switchEditorModes(target: HTMLElement): void {
        if (target.classList.contains('active')) return

        const mode = target.getAttribute('data-mmn-editor-mode') as EEditorModes

        const actions = target.closest('.actions')!.querySelectorAll<HTMLElement>('.action-btn')
        for (const actionBtn of actions) {
            actionBtn.classList.remove('active')
        }
        target.classList.add('active')

        this.getRichEditorContent().then((content) => {
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
        })
    }

    private static validateNoteContent(noteContent: string): boolean {
        let isValid: boolean = true
        if (!noteContent) {
            isValid = false
            LayoutController.toast('error', 'Do not empty your note')
        }
        return isValid
    }

    private static setEditorProgress(loading: boolean, delay: number = 0): void {
        tinymce.activeEditor.setProgressState(loading, delay)
    }

    static async publishArticleHandler(): Promise<void> {
        this.setEditorProgress(true)
        this.setLoading(true)
        this.getRichEditorContent().then(async (noteContent) => {
            if (RichEditorController.validateNoteContent(noteContent)) {
                const chunks = convertStringToChunks(
                    noteContent,
                    EArticleChunk.SIZE_IN_KiB_PER_CHUNK,
                )
                const uploadId = crypto.randomUUID()
                try {
                    await this.publishArticleInChunks(chunks, {
                        noteId: pageData.noteId,
                        noteUniqueName: getNoteUniqueNameFromURL(),
                        totalChunks: chunks.length,
                        uploadId,
                    })
                } catch (error) {
                    if (error instanceof Error) {
                        LayoutController.toast('error', error.message)
                    }
                }
            }
            this.setLoading(false)
            this.setEditorProgress(false)
        })
    }

    static async publishArticleInChunks(
        chunks: string[],
        chunkPayload: TPublishArticleInChunksPyld,
    ): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const publishHandler = (
                chunks: string[],
                chunkPayload: TPublishArticleInChunksPyld,
            ) => {
                richEditorSocket.emit(
                    EArticleEvents.PUBLISH_ARTICLE,
                    {
                        ...chunkPayload,
                        articleChunk: chunks[this.chunkIdx],
                    },
                    (res: TPublishArticleReturn) => {
                        if (res.success) {
                            this.chunkIdx++
                            if (this.chunkIdx < chunks.length) {
                                publishHandler(chunks, chunkPayload)
                            } else {
                                RichEditorController.chunkIdx = 0
                                resolve(true)
                            }
                        } else {
                            RichEditorController.chunkIdx = 0
                            reject(new BaseCustomError(res.message || "Couldn't upload article"))
                        }
                        console.log('>>> publish article res >>>', { res })
                    },
                )
            }
            publishHandler(chunks, chunkPayload)
        })
    }

    private static setLoading(loading: boolean): void {
        const btn = document.getElementById('publish-article-submit-btn') as HTMLElement
        if (loading) {
            this.htmlBefore = btn.innerHTML
            btn.innerHTML = Materials.createHTMLLoading('border')
            btn.classList.add('loading')
        } else {
            btn.innerHTML = this.htmlBefore
            btn.classList.remove('loading')
        }
    }

    static async fetchArticle(): Promise<void> {
        const { noteId } = pageData
        let apiResult: Blob
        this.setLoading(true)
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
        this.setLoading(false)
    }
}
