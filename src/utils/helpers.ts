import type { Webhook, PostData } from "../types"

/**
 * Checks if an object is a valid webhook
 */
export const isWebhook = (obj: any): obj is Webhook => 
    typeof obj === "object" && "media" in obj && "request" in obj

/**
 * Checks if a value is an object
 */
export const isObject = (value: any): boolean => 
    typeof value === "object" && value !== null

/**
 * Checks if a value is an array of objects
 */
export const isObjectArray = (value: any): boolean => 
    Array.isArray(value) && value.some((item: any) => isObject(item))

/**
 * Extracts post data from a webhook
 */
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

/**
 * Normalizes a value to an array of lowercase strings
 */
export const normalizeToArray = (value: any): string[] => {
    const values = Array.isArray(value) ? value : [value]
    return values.map((x) => String(x).toLowerCase())
}

/**
 * Formats a debug log entry
 */
export const formatDebugLogEntry = (entry: any): string => {
    if (Array.isArray(entry)) {
        return entry
            .map((item) =>
                isObject(item) && "name" in item ? item.name : isObject(item) ? JSON.stringify(item) : item
            )
            .join(", ")
    }
    if (isObject(entry)) {
        if ("name" in entry) {
            return entry.name as string
        }
        return Object.entries(entry)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? `[${value.join(", ")}]` : value}`)
            .join(", ")
    }
    return String(entry)
}

/**
 * Builds a debug log message with formatted details
 */
export const buildDebugLogMessage = (message: string, details: Record<string, any> = {}): string => {
    const formattedDetails = Object.entries(details)
        .map(([key, value]) => `${key}: ${formatDebugLogEntry(value)}`)
        .join("\n")

    return `${message}\n${formattedDetails}`
}
