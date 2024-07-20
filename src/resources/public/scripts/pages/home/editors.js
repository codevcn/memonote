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
    static setUIOfEditors(editor) {
        const noteContainers = homePage_pageMain.querySelectorAll(
            '.notes .note-form .note-editor-board .note-editor-container',
        )
        for (const noteContainer of noteContainers) {
            noteContainer.classList.remove('active')
        }
        homePage_pageMain
            .querySelector(
                `.notes .note-form .note-editor-board .note-editor-container.${editor}-editor`,
            )
            .classList.add('active')
        const settingsEditors = document.querySelectorAll(
            '#settings-form-editors .form-content .editors .editor',
        )
        for (const editor of settingsEditors) {
            editor.classList.remove('picked')
        }
        document
            .querySelector(`#settings-form-editors .form-content .editors .editor.${editor}`)
            .classList.add('picked')
        if (editor === EEditors.RICH) {
            RichEditorController.connectRichEditor()
        }
    }
    static switchEditorHandler(editor) {
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
                this.setUIOfEditors(editor)
            }
            this.setProgressOnSwitching(false)
        })
    }
}
class RichEditorController {
    static connectRichEditor() {
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
        EditorsController.setUIOfEditors(editor)
    }
}
initEditors()
