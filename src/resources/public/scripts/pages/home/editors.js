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
class EditorsController {
    static setProgressOnSwitching(loading) {
        const editorsProgress = document.querySelector(
            '#settings-form-editors .form-content .editors .progress',
        )
        editorsProgress.classList.remove('active')
        if (loading) {
            editorsProgress.classList.add('active')
        }
    }
    /**
     * Editors switcher
     * @param editor editor which switch to
     */
    static setEditors(editor) {
        const noteContainers = this.noteEditorBoard.querySelectorAll('.note-editor-section')
        for (const noteContainer of noteContainers) {
            noteContainer.classList.remove('active')
        }
        const settingsEditorItems = document.querySelectorAll(
            '#settings-form-editors .form-content .editors .editor',
        )
        for (const editorItem of settingsEditorItems) {
            editorItem.classList.remove('picked')
        }
        if (editor) {
            this.noteEditorBoard
                .querySelector(`.note-editor-section.${editor}-editor`)
                .classList.add('active')
            document
                .querySelector(`#settings-form-editors .form-content .editors .editor.${editor}`)
                .classList.add('picked')
        }
        const publishArticleBtn = document.getElementById('publish-article-submit-btn')
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
    static switchEditorsHandler(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            const noteUniqueName = getNoteUniqueNameFromURL()
            let apiSuccess = false
            this.setProgressOnSwitching(true)
            try {
                yield switchEditorAPI(noteUniqueName, editor)
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
        })
    }
}
EditorsController.switchedToRichEditor = false
EditorsController.noteEditorBoard = homePage_pageMain.querySelector('.note-form .note-editor-board')
class RichEditorController {
    static connect(config) {
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
            setup: (editor) => {
                editor.on('init', (e) => {
                    RichEditorController.fetchArticle()
                    setupScrollToBottom()
                })
            },
        }
        tinymce.init(initConfig)
    }
    static setArticleContent(content) {
        tinymce.get(this.richEditorId).setContent(content)
    }
    static getArticleContent() {
        return tinymce.get(this.richEditorId).getContent()
    }
    static setViewModeContent(content, editor) {
        editor.innerHTML = content
    }
    /**
     * Rich editor modes switcher
     * @param btnTarget html target with an attribute "data-" contains a mode
     */
    static setEditorModes(btnTarget) {
        if (btnTarget.classList.contains('active')) return
        const mode = btnTarget.getAttribute('data-mmn-editor-mode')
        const content = tinymce.get(this.richEditorId).getContent()
        const actions = btnTarget.closest('.actions').querySelectorAll('.action-btn')
        for (const actionBtn of actions) {
            actionBtn.classList.remove('active')
        }
        btnTarget.classList.add('active')
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
    }
    static validateNoteContent(noteContent) {
        let isValid = true
        if (!noteContent) {
            isValid = false
            LayoutController.toast('error', 'Do not empty your note')
        }
        return isValid
    }
    static publishArticleHandler(target) {
        return __awaiter(this, void 0, void 0, function* () {
            const htmlBefore = target.innerHTML
            this.setLoading(target, true)
            const noteContent = this.getArticleContent()
            if (this.validateNoteContent(noteContent)) {
                try {
                    yield this.publishArticle(noteContent)
                } catch (error) {
                    if (error instanceof Error) {
                        LayoutController.toast('error', error.message)
                    }
                }
            }
            this.setLoading(target, false, htmlBefore)
        })
    }
    static publishArticle(noteContent) {
        return __awaiter(this, void 0, void 0, function* () {
            const chunks = convertStringToChunks(noteContent, EArticleChunk.SIZE_IN_KB_PER_CHUNK)
            const uploadId = crypto.randomUUID()
            yield publishArticleInChunks(chunks, {
                noteId: pageData.noteId,
                noteUniqueName: getNoteUniqueNameFromURL(),
                totalChunks: chunks.length,
                uploadId,
            })
            console.log('>>> run this done publish 197')
        })
    }
    static setLoading(target, loading, htmlBefore) {
        if (loading) {
            target.innerHTML = Materials.createHTMLLoading('border')
            target.classList.add('loading')
        } else if (htmlBefore) {
            target.innerHTML = htmlBefore
            target.classList.remove('loading')
        }
    }
    static fetchArticle() {
        return __awaiter(this, void 0, void 0, function* () {
            const { noteId } = pageData
            let apiResult
            const publishArticleBtn = document.getElementById('publish-article-submit-btn')
            const htmlBefore = publishArticleBtn.innerHTML
            this.setLoading(publishArticleBtn, true)
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
            this.setLoading(publishArticleBtn, false, htmlBefore)
        })
    }
}
RichEditorController.richEditorId = 'mmn-rich-note-editor'
const initEditors = () => {
    const { editor } = pageData
    if (editor) {
        EditorsController.setEditors(editor)
    } else {
        EditorsController.setEditors(EEditors.NORMAL)
    }
    // setup "actions"
    const actions = homePage_pageMain.querySelectorAll('#rich-editor-section .actions .action-btn')
    for (const actionBtn of actions) {
        actionBtn.addEventListener('click', function (e) {
            RichEditorController.setEditorModes(actionBtn)
        })
    }
}
initEditors()
