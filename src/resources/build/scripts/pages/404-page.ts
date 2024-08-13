const copyContainer = document.querySelector('.copy-container') as HTMLElement
const replayIcon = document.getElementById('cb-replay') as HTMLElement
const copyWidth = copyContainer.querySelector('p')!.offsetWidth

const mySplitText = new SplitText(copyContainer, { type: 'words' })
const splitTextTimeline = gsap.timeline()
const handleTL = gsap.timeline()

const tl = gsap.timeline()

tl.add(() => {
    animateCopy()
    blinkHandle()
}, 0.2)

function animateCopy() {
    mySplitText.split({ type: 'chars, words' })
    splitTextTimeline.staggerFrom(
        mySplitText.chars,
        0.001,
        {
            autoAlpha: 0,
            ease: 'back.inOut(1.7)',
            onComplete: animateHandle,
        },
        0.05,
    )
}

function blinkHandle() {
    handleTL.fromTo(
        '.handle',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4, repeat: -1, yoyo: true },
    )
}

function animateHandle() {
    handleTL.to('.handle', { x: copyWidth, duration: 0.7, ease: 'steppedEase(12)' })
}

replayIcon.addEventListener('click', () => {
    splitTextTimeline.restart()
    handleTL.restart()
})
