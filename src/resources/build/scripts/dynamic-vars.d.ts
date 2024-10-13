declare type TUnknownObject = {
    [key: number | string]: any
}
declare type TUnknownFunction<R> = (...args: any[]) => R
declare const dayjs: any
declare const axios: any
declare function io(...args: any[]): any
declare const bootstrap: any
declare const pageData: { [key: string | number]: any }
declare const tinymce: any
declare const gsap: any
declare class Tesseract {
    static createWorker(...args: any[]): Promise<NSTesseract.Worker>
}
declare const Konva: any
declare namespace NSTesseract {
    interface Worker extends TUnknownObject {
        recognize(...args: any[]): Promise<RecognizeResult>
    }
    interface RecognizeResult {
        jobId: string
        data: Page
    }
    interface Page {
        blocks: Block[] | null
        confidence: number
        lines: Line[]
        oem: string
        osd: string
        paragraphs: Paragraph[]
        psm: string
        symbols: Symbol[]
        text: string
        version: string
        words: Word[]
        hocr: string | null
        tsv: string | null
        box: string | null
        unlv: string | null
        sd: string | null
        imageColor: string | null
        imageGrey: string | null
        imageBinary: string | null
        rotateRadians: number | null
        pdf: number[] | null
        debug: string | null
    }
    interface Block {
        paragraphs: Paragraph[]
        text: string
        confidence: number
        baseline: Baseline
        bbox: Bbox
        blocktype: string
        polygon: any
        page: Page
        lines: Line[]
        words: Word[]
        symbols: Symbol[]
    }
    interface Baseline {
        x0: number
        y0: number
        x1: number
        y1: number
        has_baseline: boolean
    }
    interface Paragraph {
        lines: Line[]
        text: string
        confidence: number
        baseline: Baseline
        bbox: Bbox
        is_ltr: boolean
        block: Block
        page: Page
        words: Word[]
        symbols: Symbol[]
    }
    interface Symbol {
        choices: Choice[]
        image: any
        text: string
        confidence: number
        baseline: Baseline
        bbox: Bbox
        is_superscript: boolean
        is_subscript: boolean
        is_dropcap: boolean
        word: Word
        line: Line
        paragraph: Paragraph
        block: Block
        page: Page
    }
    interface Line {
        words: Word[]
        text: string
        confidence: number
        baseline: Baseline
        rowAttributes: RowAttributes
        bbox: Bbox
        paragraph: Paragraph
        block: Block
        page: Page
        symbols: Symbol[]
    }
    interface Choice {
        text: string
        confidence: number
    }
    interface Word {
        symbols: Symbol[]
        choices: Choice[]
        text: string
        confidence: number
        baseline: Baseline
        bbox: Bbox
        is_numeric: boolean
        in_dictionary: boolean
        direction: string
        language: string
        is_bold: boolean
        is_italic: boolean
        is_underlined: boolean
        is_monospace: boolean
        is_serif: boolean
        is_smallcaps: boolean
        font_size: number
        font_id: number
        font_name: string
        line: Line
        paragraph: Paragraph
        block: Block
        page: Page
    }
    interface Bbox {
        x0: number
        y0: number
        x1: number
        y1: number
    }
    interface Block {
        paragraphs: Paragraph[]
        text: string
        confidence: number
        baseline: Baseline
        bbox: Bbox
        blocktype: string
        polygon: any
        page: Page
        lines: Line[]
        words: Word[]
        symbols: Symbol[]
    }
}
