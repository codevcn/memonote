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
    static setEditors(editor) {
        const noteContainers = this.noteEditorBoard.querySelectorAll('.note-editor-container')
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
                .querySelector(`.note-editor-container.${editor}-editor`)
                .classList.add('active')
            document
                .querySelector(`#settings-form-editors .form-content .editors .editor.${editor}`)
                .classList.add('picked')
        }
        if (editor === EEditors.RICH && !this.switchedToRichEditor) {
            const { placeholder } = pageData.initRichEditorData
            RichEditorController.connectRichEditor({ lang: pageData.currentLang, placeholder })
            this.switchedToRichEditor = true
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
    static connectRichEditor(config) {
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
    static setEditorModes(btnTarget) {
        if (btnTarget.classList.contains('active')) return
        const mode = btnTarget.getAttribute('data-mmn-editor-mode')
        const content = tinymce.get('mmn-rich-note-editor').getContent()
        const viewModeContainer = document.getElementById('rich-editor-view-mode')
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
const initEditors = () => {
    const { editor } = pageData
    if (editor) {
        EditorsController.setEditors(editor)
    }
    // setup "actions"
    const actionBtns = homePage_pageMain.querySelectorAll('#rich-editor-edit-mode .actions .action')
    for (const actionBtn of actionBtns) {
        actionBtn.addEventListener('click', function (e) {
            RichEditorController.setEditorModes(actionBtn)
        })
    }
}
initEditors()
