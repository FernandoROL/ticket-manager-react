const MAX_FILE_BYTES = 10 * 1024 * 1024
const MAX_SIDE = 256
const MAX_DATA_URL_LENGTH = 128 * 1024

export async function prepareAvatar(file) {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
        throw new Error('Choose a JPEG or PNG image.')
    }
    if (file.size > MAX_FILE_BYTES) {
        throw new Error('Choose an image smaller than 10 MiB.')
    }

    const source = URL.createObjectURL(file)
    try {
        const image = new Image()
        image.src = source
        await image.decode()

        const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext('2d')
        context.fillStyle = '#fff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, 0, 0, canvas.width, canvas.height)

        const avatar = canvas.toDataURL('image/jpeg', 0.8)
        if (!avatar.startsWith('data:image/jpeg;base64,') || avatar.length > MAX_DATA_URL_LENGTH) {
            throw new Error('This image could not be saved as a small avatar.')
        }
        return avatar
    } finally {
        URL.revokeObjectURL(source)
    }
}
