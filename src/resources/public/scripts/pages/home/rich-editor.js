'use strict'
var EArticleEvents
;(function (EArticleEvents) {
    EArticleEvents['PUBLISH_ARTICLE'] = 'publish_article'
    EArticleEvents['UPLOAD_IMAGE'] = 'upload_image'
})(EArticleEvents || (EArticleEvents = {}))
class ArticleSocket {
    constructor() {
        this.socket = io(
            `/${ENamespacesOfSocket.ARTICLE}`,
            initClientSocketConfig(getNoteUniqueNameFromURL(), pageData.noteId),
        )
        this.reconnecting = { flag: false }
        this.listenConnected()
        this.listenConnectionError()
    }
    async listenConnected() {
        this.socket.on(EInitSocketEvents.CLIENT_CONNECTED, (data) => {
            if (this.reconnecting.flag) {
                LayoutController.toast('success', 'Connected to server.', 2000)
                this.reconnecting.flag = false
            }
            console.log('>>> article Socket connected to server.')
        })
    }
    async listenConnectionError() {
        this.socket.on(EInitSocketEvents.CONNECT_ERROR, (err) => {
            if (this.socket.active) {
                LayoutController.toast('info', 'Trying to connect with the server.', 2000)
                this.reconnecting.flag = true
            } else {
                LayoutController.toast('error', "Can't connect with the server.")
                console.error(`>>> Article Socket connect_error due to >>> ${err.message}`)
            }
        })
    }
    emitWithoutTimeout(event, payload, cb) {
        this.socket.emit(event, payload, cb)
    }
    emitWithTimeout(event, payload, cb, timeout) {
        this.socket.timeout(timeout).emit(event, payload, cb)
    }
}
const articleSocket = new ArticleSocket()
class RichEditorController {
    static initConfig(placeholder, language) {
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
            setup: RichEditorController.setupAfterInit,
        }
        return config
    }
    static setupAfterInit(editor) {
        editor.on('init', (e) => {
            setupScrollToBottom()
            RichEditorController.fetchArticle()
            const heightOfEditor = LocalStorageController.getHeightOfRichEditor()
            if (heightOfEditor) {
                const setHeightInput = document.getElementById('set-editor-height-input')
                setHeightInput.value = heightOfEditor
                RichEditorController.setHeightOfEditor(setHeightInput)
            }
        })
    }
    static getEditor() {
        return tinymce.activeEditor
    }
    static async connect() {
        setTimeout(() => {
            const { richEditorData, currentLang } = pageData
            const { placeholder } = richEditorData
            const config = this.initConfig(placeholder, currentLang)
            tinymce.init(config)
        }, 0)
    }
    static uploadImageHandler(image) {
        return new Promise((resolve, reject) => {
            articleSocket.emitWithoutTimeout(
                EArticleEvents.UPLOAD_IMAGE,
                {
                    image,
                    noteId: pageData.noteId,
                },
                (res) => {
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
    static validateImage(image) {
        if (!image) return false
        if (image.size > this.IMAGE_MAX_SIZE) {
            LayoutController.toast('error', `Image must be less than ${this.IMAGE_MAX_SIZE}`)
            return false
        }
        return true
    }
    static async pickImageHandler(cb, value, meta) {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.addEventListener('change', (e) => {
            const image = e.target.files[0]
            if (RichEditorController.validateImage(image)) {
                LayoutController.setAppProgress('on')
                RichEditorController.uploadImageHandler(image)
                    .then((uploadedImg) => {
                        const { imgURL } = uploadedImg
                        cb(imgURL, {
                            title: image.name,
                            alt: 'Article Image',
                        })
                    })
                    .catch((err) => {
                        LayoutController.toast('error', err.message)
                    })
                    .finally(() => {
                        LayoutController.setAppProgress('off')
                    })
            }
        })
        input.click()
    }
    static setStyleOfEditor(style) {
        const container = this.getEditor().getContainer()
        const { height } = style
        if (height) container.style.height = `${style.height}px`
    }
    static setHeightOfEditor(target) {
        const inputValue = target.value
        const messageEle = target.closest('.set-editor-height').querySelector('.message')
        if (inputValue) {
            const height = parseInt(inputValue)
            if (Number.isInteger(height) && height >= this.minHeightOfEditor) {
                this.setStyleOfEditor({ height })
                messageEle.classList.remove('active')
                LocalStorageController.setHeightOfRichEditor(height)
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
    static setArticleContent(content) {
        setTimeout(() => {
            RichEditorController.getEditor().setContent(content)
        }, 0)
    }
    static setViewModeContent(content, editor) {
        editor.innerHTML = content
    }
    static getRichEditorContent() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(RichEditorController.getEditor().getContent())
            }, 0)
        })
    }
    static getImgSrcList(articleContent) {
        const domParser = new DOMParser()
        const articleContentInHTML = domParser.parseFromString(articleContent, 'text/html')
        const imgs = articleContentInHTML.querySelectorAll('img')
        return Array.from(imgs).map((img) => img.src)
    }
    /**
     * Rich editor modes switcher
     * @param target html target with an attribute "data-" contains a mode
     */
    static switchEditorModes(target) {
        if (target.classList.contains('active')) return
        const mode = target.getAttribute('data-mmn-editor-mode')
        const actions = target.closest('.actions').querySelectorAll('.action-btn')
        for (const actionBtn of actions) {
            actionBtn.classList.remove('active')
        }
        target.classList.add('active')
        this.getRichEditorContent().then(async (content) => {
            const viewModeSection = document.querySelector(
                '#rich-editor-section .rich-editor-mode.view-mode',
            )
            RichEditorController.setViewModeContent(content, viewModeSection)
            viewModeSection.classList.remove('active')
            const editModeSection = document.querySelector(
                '#rich-editor-section .rich-editor-mode.edit-mode',
            )
            editModeSection.classList.remove('active')
            if (mode === EEditorModes.EDIT_MODE) {
                editModeSection.classList.add('active')
            } else if (mode === EEditorModes.VIEW_MODE) {
                viewModeSection.classList.add('active')
            }
        })
    }
    static validateNoteContent(articleContent) {
        if (!articleContent) {
            LayoutController.toast('error', 'Do not empty your note')
            return false
        }
        return true
    }
    static setEditorProgress(loading, delay = 0) {
        this.getEditor().setProgressState(loading, delay)
    }
    static publishArticleHandler() {
        this.setLoading(true)
        this.getRichEditorContent().then((articleContent) => {
            if (!RichEditorController.validateNoteContent(articleContent)) return
            const imgs = RichEditorController.getImgSrcList(articleContent)
            const { noteId } = pageData
            RichEditorController.updateImagesInArticle(imgs, noteId)
                .then(() => {
                    const chunks = convertStringToChunks(
                        articleContent,
                        EArticleChunk.SIZE_PER_CHUNK,
                    )
                    RichEditorController.publishArticleInChunks(
                        chunks,
                        {
                            noteUniqueName: getNoteUniqueNameFromURL(),
                            totalChunks: chunks.length,
                            uploadId: generateUploadId(),
                        },
                        noteId,
                    )
                        .then(() => {
                            LayoutController.setGeneralAppStatus('success')
                        })
                        .catch((error) => {
                            LayoutController.toast('error', error.message)
                        })
                })
                .catch((error) => {
                    LayoutController.toast('error', error.message)
                })
            this.setLoading(false)
        })
    }
    static updateImagesInArticle(imgs, noteId) {
        if (imgs && imgs.length > 0) {
            return new Promise((resolve, reject) => {
                articleSocket.emitWithoutTimeout(
                    EArticleEvents.PUBLISH_ARTICLE,
                    { imgs, noteId },
                    (res) => {
                        if (res.success) {
                            resolve(true)
                        } else {
                            reject(new BaseCustomError(res.message || "Couldn't upload article"))
                        }
                    },
                )
            })
        }
        return Promise.resolve(true)
    }
    static publishArticleInChunks(chunks, chunkPayload, noteId) {
        return new Promise((resolve, reject) => {
            const publishHandler = (chunks, chunkPayload) => {
                const chunk = chunks[this.chunkIdx]
                articleSocket.emitWithoutTimeout(
                    EArticleEvents.PUBLISH_ARTICLE,
                    {
                        articleChunk: {
                            ...chunkPayload,
                            chunk,
                        },
                        noteId,
                    },
                    (res) => {
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
    static setLoading(loading) {
        const btn = document.getElementById('publish-article-submit-btn')
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
    static async fetchArticle() {
        let apiResult
        this.setLoading(true)
        try {
            const { data } = await fetchArticleAPI()
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
                const content = reader.result
                RichEditorController.setArticleContent(content)
            }
            reader.readAsText(apiResult)
        }
        this.setLoading(false)
    }
}
RichEditorController.richEditorId = 'mmn-rich-note-editor'
RichEditorController.chunkIdx = 0
RichEditorController.htmlBefore = ''
RichEditorController.minHeightOfEditor = 300
RichEditorController.defaultHeightOfEditor = 400
RichEditorController.IMAGE_MAX_SIZE = convertToBytes('4MB')
