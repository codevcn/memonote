'use strict'
class RichEditorController {
    static connectRichEditor() {
        const config = {
            selector: 'textarea#mmn-rich-note-editor',
            plugins: 'link lists table wordcount linkchecker',
            toolbar:
                'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
        }
        tinymce.init(config)
    }
}
