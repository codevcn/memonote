const container = document.getElementById('container')
const textContent = document.getElementById('text-content')

// Initialize Konva.js Stage and Layer
const IMG_WIDTH = 600
const IMG_HEIGHT = 400
const stage = new Konva.Stage({
    container: 'container',
    width: IMG_WIDTH,
    height: IMG_HEIGHT,
})

const layer = new Konva.Layer()
stage.add(layer)

// Hàm để làm nổi bật bounding box được chọn
function highlightSelectedBox(selectedRect) {
    // Reset tất cả các bounding boxes
    layer.find('Rect').forEach((rect) => {
        rect.stroke('red')
        rect.strokeWidth(2)
    })

    // Làm nổi bật bounding box được chọn
    selectedRect.stroke('blue')
    selectedRect.strokeWidth(3)
    layer.draw()
}

// Function to process image with Tesseract.js
async function processImage(imageUrl) {
    const worker = await Tesseract.createWorker(['eng', 'vie'])

    console.log('>>> run this')

    // await worker.setParameters({
    //     tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
    // })

    const result = await worker.recognize(imageUrl)

    console.log('>>> result >>>', result.data)

    const { words } = result.data // Extract words from Tesseract result

    const imgObj = new Image()
    imgObj.onload = function () {
        // Calculate the scale between image size and canvas size
        const imgWidth = imgObj.width
        const imgHeight = imgObj.height
        const canvasWidth = stage.width()
        const canvasHeight = stage.height()
        const scaleX = canvasWidth / imgWidth
        const scaleY = canvasHeight / imgHeight

        // Draw the image on Konva
        const image = new Konva.Image({
            x: 0,
            y: 0,
            image: imgObj,
            width: canvasWidth,
            height: canvasHeight,
        })
        layer.add(image)

        // Draw bounding boxes for detected words
        words.forEach((word, index) => {
            const { bbox } = word // Get bounding box for each word

            let rect

            if (index === 0) {
                rect = new Konva.Rect({
                    x: bbox.x0 - 10,
                    y: bbox.y0,
                    width: bbox.x1 - bbox.x0 - 30,
                    height: bbox.y1 - bbox.y0 - 20,
                    stroke: 'red',
                    strokeWidth: 2,
                    draggable: false,
                })
            } else {
                rect = new Konva.Rect({
                    x: bbox.x0 * scaleX,
                    y: bbox.y0 * scaleY,
                    width: (bbox.x1 - bbox.x0) * scaleX,
                    height: (bbox.y1 - bbox.y0) * scaleY,
                    stroke: 'red',
                    strokeWidth: 2,
                    draggable: false,
                })
            }

            // Add click event to display text when box is clicked
            rect.on('click', () => {
                textContent.innerText = word.text // Display word text
                highlightSelectedBox(rect)
            })

            layer.add(rect)
        })

        layer.draw()
    }
    imgObj.crossOrigin = 'Anonymous' // Để tránh vấn đề CORS nếu hình ảnh từ domain khác
    imgObj.src = imageUrl
}

// Handle image file input
const imageUrl = 'An-English-Vietnamese-sentence-pair.png' // Thay thế bằng đường dẫn thực tế
processImage(imageUrl)
