// init types, enums, ...
enum EArticleEvents {
    PUBLISH_ARTICLE = 'publish_article',
    UPLOAD_IMAGE = 'upload_image',
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

type TMetaOfPickImage = {
    filetype: string
    [key: string]: any
}

type TUploadedImg = {
    imgURL: string
    imgPublicId: string
}

type TUploadImageReturn = TSuccess & {
    message?: string
    uploadedImg?: TUploadedImg
}

type TArticleWorkerMsgData = {
    imgPublicIds: string[]
}

type TArticleWorkerMsgID<T> = {
    [key: string]: T
}

// init socket
const articleSocket = io(`/${ENamespacesOfSocket.ARTICLE}`, clientSocketConfig)

// init vars
const articleSocketReconnecting: TSocketReconnecting = { flag: false }

// listeners
articleSocket.on(EInitSocketEvents.CLIENT_CONNECTED, async (data: TClientConnectedEventPld) => {
    if (notificationSocketReconnecting.flag) {
        LayoutController.toast('success', 'Connected to server.', 2000)
        notificationSocketReconnecting.flag = false
    }
    console.log('>>> article Socket connected to server.')
})

articleSocket.on(EInitSocketEvents.CONNECT_ERROR, async (err: Error) => {
    if (articleSocket.active) {
        LayoutController.toast('info', 'Trying to connect with the server.', 2000)
        notificationSocketReconnecting.flag = true
    } else {
        LayoutController.toast('error', "Can't connect with the server.")
        console.error(`>>> article Socket connect_error due to ${err.message}`)
    }
})

class RichEditorController {
    private static readonly richEditorId: string = 'mmn-rich-note-editor'
    private static chunkIdx: number = 0
    private static htmlBefore: string = ''
    private static minHeightOfEditor: number = 300
    private static defaultHeightOfEditor: number = 400
    private static readonly IMAGE_MAX_SIZE = convertToBytes('1MB')!

    private static initConfig(placeholder: string, language: string): object {
        const imageConfig = {
            file_picker_callback: this.pickImageHandler,
            file_picker_types: 'image',
            image_title: true,
        }

        const mobileResponsiveConfig = {
            toolbar_mode: 'wrap',
            height: this.minHeightOfEditor + 200,
        }

        const containerConfig = {
            min_height: this.minHeightOfEditor,
            height: this.defaultHeightOfEditor,
            toolbar_sticky: true,
        }

        const fontsConfig = {
            font_family_formats: `Arial=Arial, Helvetica, sans-serif; 
                Work Sans=Work Sans, Arial, sans-serif;
                Poppins=Poppins, Arial, sans-serif;
                Times New Roman=Times New Roman, Times, serif;
                Roboto=Roboto, Times, serif`,
        }

        const additionalCssConfig = {
            content_css: '/styles/pages/home-page/tinymce.css',
        }

        const config = {
            selector: `textarea#${this.richEditorId}`,
            plugins: 'link lists table wordcount linkchecker preview save fullscreen image',
            placeholder,
            toolbar:
                'undo redo | blocks fontfamily fontsize forecolor backcolor | bold italic underline strikethrough | link table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap image | removeformat | fullscreen',
            skin: 'bootstrap',
            language,
            menubar: false,
            elementpath: false,
            ...additionalCssConfig,
            ...fontsConfig,
            ...containerConfig,
            mobile: mobileResponsiveConfig,
            ...imageConfig,
            setup: (editor: any) => {
                editor.on('init', (e: Event) => {
                    setupScrollToBottom()
                    RichEditorController.fetchArticle()
                })
            },
        }

        return config
    }

    private static getEditor(): any {
        return tinymce.activeEditor
    }

    static async connect(): Promise<void> {
        setTimeout(() => {
            const { richEditorData, currentLang } = pageData
            const { placeholder } = richEditorData

            const config = this.initConfig(placeholder, currentLang)

            tinymce.init(config)
        }, 0)
    }

    static uploadImageHandler(image: File): Promise<TUploadedImg> {
        return new Promise((resolve, reject) => {
            articleSocket.emit(
                EArticleEvents.UPLOAD_IMAGE,
                {
                    image,
                    noteId: pageData.noteId,
                },
                (res: TUploadImageReturn) => {
                    if (res.success) {
                        const { uploadedImg } = res
                        if (uploadedImg) {
                            resolve(uploadedImg)
                        }
                    } else {
                        const { message } = res
                        if (message) {
                            reject(new BaseCustomError(message))
                        } else {
                            reject(new BaseCustomError('Cannot upload the images'))
                        }
                    }
                    console.log('>>> res of upload image >>>', res)
                },
            )
        })
    }

    static validateImage(image: File): boolean {
        if (!image) return false
        if (image.size > this.IMAGE_MAX_SIZE) {
            LayoutController.toast('error', `Image must be less than ${this.IMAGE_MAX_SIZE}`)
            return false
        }
        return true
    }

    private static async pickImageHandler(
        cb: TUnknownFunction,
        value: any,
        meta: TMetaOfPickImage,
    ): Promise<void> {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.addEventListener('change', (e) => {
            const image = (e.target as HTMLInputElement).files![0]
            if (RichEditorController.validateImage(image)) {
                LayoutController.setAppProgress('on')
                RichEditorController.uploadImageHandler(image)
                    .then((uploadedImg) => {
                        const { imgURL, imgPublicId } = uploadedImg
                        cb(imgURL, {
                            title: image.name,
                            alt: 'Article Image',
                            dataMmn: 'oke',
                        })
                    })
                    .catch((err: BaseCustomError) => {
                        LayoutController.toast('error', err.message)
                    })
                    .finally(() => {
                        LayoutController.setAppProgress('off')
                    })
            }
        })
        input.click()
    }

    private static setStyleOfEditor(style: TCssForSettingStyleOfEditor): void {
        const container = this.getEditor().getContainer() as HTMLElement
        const { height } = style
        if (height) container.style.height = `${style.height}px`
    }

    static setHeightOfEditor(e: Event): void {
        const input = e.target as HTMLInputElement
        const inputValue = input.value
        const messageEle = input
            .closest('.set-editor-height')!
            .querySelector('.message') as HTMLElement
        if (inputValue) {
            const height = parseInt(inputValue)
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
        } else {
            this.setStyleOfEditor({ height: this.defaultHeightOfEditor })
        }
    }

    private static setArticleContent(content: string): void {
        setTimeout(() => {
            RichEditorController.getEditor().setContent(content)
        }, 0)
    }

    private static setViewModeContent(content: string, editor: HTMLElement): void {
        editor.innerHTML = content
    }

    private static getRichEditorContent(): Promise<string> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(RichEditorController.getEditor().getContent() as string)
            }, 0)
        })
    }

    static getImgSrcList(articleContent: string): string[] {
        const domParser = new DOMParser()
        const articleContentInHTML = domParser.parseFromString(articleContent, 'text/html')
        const imgs = articleContentInHTML.querySelectorAll('img')
        return Array.from(imgs).map((img) => img.src)
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

        this.getRichEditorContent().then(async (content) => {
            const viewModeSection = document.querySelector(
                '#rich-editor-section .rich-editor-mode.view-mode',
            ) as HTMLElement
            RichEditorController.setViewModeContent(content, viewModeSection)
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

            const imgs = RichEditorController.getImgSrcList(content)
            console.log('>>> imgs >>>', { imgs })
        })
    }

    private static validateNoteContent(articleContent: string): boolean {
        let isValid: boolean = true
        if (!articleContent) {
            isValid = false
            LayoutController.toast('error', 'Do not empty your note')
        }
        return isValid
    }

    private static setEditorProgress(loading: boolean, delay: number = 0): void {
        this.getEditor().setProgressState(loading, delay)
    }

    static async publishArticleHandler(): Promise<void> {
        this.setLoading(true)
        this.getRichEditorContent().then(async (articleContent) => {
            if (RichEditorController.validateNoteContent(articleContent)) {
                const chunks = convertStringToChunks(articleContent, EArticleChunk.SIZE_PER_CHUNK)
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
        })
    }

    static publishArticleInChunks(
        chunks: string[],
        chunkPayload: TPublishArticleInChunksPyld,
    ): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const publishHandler = (
                chunks: string[],
                chunkPayload: TPublishArticleInChunksPyld,
            ) => {
                articleSocket.emit(
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
            this.setEditorProgress(true)
            this.htmlBefore = btn.innerHTML
            btn.innerHTML = Materials.createHTMLLoading('border')
            btn.classList.add('loading')
        } else {
            btn.innerHTML = this.htmlBefore
            btn.classList.remove('loading')
            this.setEditorProgress(false)
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
