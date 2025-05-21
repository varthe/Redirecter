import type { Webhook, PostData } from "./types"

const isObject = (value: any): boolean => typeof value === "object" && value !== null
const isObjectArray = (value: any): boolean => Array.isArray(value) && value.some((item: any) => isObject(item))

export const isWebhook = (obj: any): obj is Webhook => typeof obj === "object" && "media" in obj && "request" in obj

export const getPostData = (requestData: Webhook): PostData => {
    const { media, extra } = requestData
    const postData: PostData = { mediaType: media.media_type }

    if (media.media_type !== "tv" || !extra || extra.length === 0) {
        return postData
    }

    const seasons = extra
        .find((item: any) => item.name === "Requested Seasons")
        ?.value?.split(",")
        .map(Number)
        .filter(Number.isInteger)

    if (seasons?.length > 0) {
        postData["seasons"] = seasons
    }

    return postData
}
