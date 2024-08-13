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
     * Editors switcher, change UI of editors
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
                this.switchedToRichEditor = true
                RichEditorController.connect()
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
            RichEditorController.switchEditorModes(actionBtn)
        })
    }
}
initEditors()
