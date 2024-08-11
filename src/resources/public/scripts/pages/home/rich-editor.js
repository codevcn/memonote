'use strict'
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value)
                  })
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value))
                } catch (e) {
                    reject(e)
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value))
                } catch (e) {
                    reject(e)
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next())
        })
    }
// init types, enums, ...
var EArticleEvents
;(function (EArticleEvents) {
    EArticleEvents['PUBLISH_ARTICLE'] = 'publish_article'
})(EArticleEvents || (EArticleEvents = {}))
// init socket
const richEditorSocket = io(`/${ENamespacesOfSocket.RICH_EDITOR}`, clientSocketConfig)
class RichEditorController {
    static connect(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const initConfig = {
                selector: `textarea#${this.richEditorId}`,
                plugins: 'link lists table wordcount linkchecker preview save fullscreen',
                placeholder: config.placeholder,
                toolbar:
                    'undo redo | blocks fontfamily fontsize forecolor backcolor | bold italic underline strikethrough | link table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat | fullscreen',
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
                mobile: {
                    toolbar_mode: 'wrap',
                    height: 500,
                },
                setup: (editor) => {
                    editor.on('init', (e) => {
                        RichEditorController.fetchArticle()
                        setupScrollToBottom()
                    })
                },
            }
            tinymce.init(initConfig)
        })
    }
    setStyleOfEditor(style) {
        const container = tinymce.activeEditor.getContainer()
        const { height } = style
        if (height) container.style.height = `${style.height}px`
    }
    static setArticleContent(content) {
        tinymce.activeEditor.setContent(content)
    }
    static setViewModeContent(content, editor) {
        editor.innerHTML = content
    }
    static getRichEditorContent() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(tinymce.activeEditor.getContent())
            }, 0)
        })
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
        this.getRichEditorContent().then((content) => {
            const viewModeSection = document.querySelector(
                '#rich-editor-section .rich-editor-mode.view-mode',
            )
            this.setViewModeContent(content, viewModeSection)
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
    static validateNoteContent(noteContent) {
        let isValid = true
        if (!noteContent) {
            isValid = false
            LayoutController.toast('error', 'Do not empty your note')
        }
        return isValid
    }
    static setEditorProgress(loading, delay = 0) {
        tinymce.activeEditor.setProgressState(loading, delay)
    }
    static publishArticleHandler() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setEditorProgress(true)
            this.setLoading(true)
            this.getRichEditorContent().then((noteContent) =>
                __awaiter(this, void 0, void 0, function* () {
                    if (RichEditorController.validateNoteContent(noteContent)) {
                        const chunks = convertStringToChunks(
                            noteContent,
                            EArticleChunk.SIZE_IN_KiB_PER_CHUNK,
                        )
                        const uploadId = crypto.randomUUID()
                        try {
                            yield this.publishArticleInChunks(chunks, {
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
                }),
            )
        })
    }
    static publishArticleInChunks(chunks, chunkPayload) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const publishHandler = (chunks, chunkPayload) => {
                    richEditorSocket.emit(
                        EArticleEvents.PUBLISH_ARTICLE,
                        Object.assign(Object.assign({}, chunkPayload), {
                            articleChunk: chunks[this.chunkIdx],
                        }),
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
                                reject(
                                    new BaseCustomError(res.message || "Couldn't upload article"),
                                )
                            }
                            console.log('>>> publish article res >>>', { res })
                        },
                    )
                }
                publishHandler(chunks, chunkPayload)
            })
        })
    }
    static setLoading(loading) {
        const btn = document.getElementById('publish-article-submit-btn')
        if (loading) {
            this.htmlBefore = btn.innerHTML
            btn.innerHTML = Materials.createHTMLLoading('border')
            btn.classList.add('loading')
        } else {
            btn.innerHTML = this.htmlBefore
            btn.classList.remove('loading')
        }
    }
    static fetchArticle() {
        return __awaiter(this, void 0, void 0, function* () {
            const { noteId } = pageData
            let apiResult
            this.setLoading(true)
            try {
                const { data } = yield fetchArticleAPI(noteId)
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
        })
    }
}
RichEditorController.richEditorId = 'mmn-rich-note-editor'
RichEditorController.chunkIdx = 0
RichEditorController.htmlBefore = ''
