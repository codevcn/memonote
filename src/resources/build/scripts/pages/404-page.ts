const goBackYourNote = (): void => {
    const noteUniqueName = LocalStorageController.getYourNote()
    if (noteUniqueName) {
        window.location.assign(`/${noteUniqueName}`)
    } else {
        window.location.assign('/')
    }
}

const init404Page = (): void => {
    gsap.from('.error', {
        duration: 1.5,
        y: -50,
        opacity: 0,
        ease: 'bounce.out',
    })

    gsap.from('.message', {
        duration: 2,
        y: 50,
        opacity: 0,
        ease: 'power2.out',
        delay: 0.5,
    })

    gsap.from('.go-back-your-note', {
        duration: 2.5,
        scale: 0.5,
        opacity: 0,
        ease: 'back.out(1.7)',
        delay: 1,
    })
}
init404Page()
