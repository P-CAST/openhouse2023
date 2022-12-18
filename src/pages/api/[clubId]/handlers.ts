import { executeOverPerm } from "@handlers/permCheck"
import { handlers } from "@handlers/gcpHandlers"
import { getClubPendArticle, getClubProdArticle, updateArticleToPending } from "@lib/dbMethod"

export default async function apiHandlers(req, res) {
    const {act} = JSON.parse(req.body)

    switch (act) {
        case 'getPolicy': {
            return uploadToGCP(req, res)
        }
        case 'pendingcontent': {
            return getPendContent(req, res)
        }
        case 'prodcontent': {
            return getProdContent(req, res)
        }
        default: return res.status(404)
    }
}

async function uploadToGCP(req, res) {
    if (req.method == 'POST') {
        const {clubId} = req.query
        return await executeOverPerm(req, res, ['tucmc', 'clubPresident'],
        async (req, res) => {
            const result = await handlers('toGCP', req.body, clubId)
            const affirmPending = await updateArticleToPending(clubId, req.body)
            return res.send(JSON.stringify(result))
        })
    }
    return res.send(304)
}

async function getPendContent(req, res) {
    const {clubId} = req.query

    if (req.method == 'POST') {
        return await executeOverPerm(req, res, ['tucmc', 'clubPresident'],
            async (req, res) => {
                let finalData = {}
                const clubPendArticle = await getClubPendArticle(clubId)
                if (clubPendArticle) {
                    finalData = clubPendArticle

                    finalData['imageUrl'] = {}
                    Object.keys(clubPendArticle?.Images).length != 0 ? finalData['imageUrl'] = await handlers('getImage', JSON.stringify(clubPendArticle?.Images), clubId) : false
                    let reviewImageUrl = {}
                    for (const index in finalData['Reviews']) {
                        finalData['Reviews'][index]['Image'] ? reviewImageUrl[index] = finalData['Reviews'][index]['Image'] : null
                    }
                    finalData['reviewImageUrl'] = await handlers('getImage', JSON.stringify(reviewImageUrl), clubId)
                    if (finalData) return res.json(finalData)
                }
                return res.json({nonexisted: true})
            }
        )
    }
    return res.send(304)
}

async function getProdContent(req, res) {
    const {clubId} = req.query

    let finalData = {}
    const clubArticle = await getClubProdArticle(clubId)
    if (clubArticle) {
        finalData = clubArticle

        finalData['imageUrl'] = {}
        Object.keys(clubArticle?.Images).length != 0 ? finalData['imageUrl'] = await handlers('getImage', JSON.stringify(clubArticle?.Images), clubId) : false
        let reviewImageUrl = {}
        for (const index in finalData['Reviews']) {
            finalData['Reviews'][index]['Image'] ? reviewImageUrl[index] = finalData['Reviews'][index]['Image'] : null
        }
        finalData['reviewImageUrl'] = await handlers('getImage', JSON.stringify(reviewImageUrl), clubId)
        if (finalData) return res.json(finalData)
    }
    return res.json({nonexisted: true})
}
