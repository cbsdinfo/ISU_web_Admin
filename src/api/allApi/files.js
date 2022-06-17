import request from '@/utils/request'
import * as imageConversion from 'image-conversion'

const api = {
    Upload(data) {
        return request({
            url: '/Files/Upload',
            method: 'post',
            data
        })
    },
    Delete(data) {
        return request({
            url: '/Files/Delete',
            method: 'post',
            data
        })
    },
    async compressFile(inputFile, toSize) {
        const resCompressBolb = await imageConversion.compressAccurately(inputFile, toSize)
        const convertFile = new window.File(
            [resCompressBolb],
            inputFile.name,
            { type: inputFile.type }
        )
        return convertFile
    }
}

export default api
