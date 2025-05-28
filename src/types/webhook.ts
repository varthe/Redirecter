export interface Webhook {
    notification_type: string
    media: Media
    request: Request
    extra?: Array<any>
}

export interface Media {
    media_type: string
    tmdbId: string
    status: string
    status4k: string
}

export interface Request {
    request_id: string
    requestedBy_username: string
    requestedBy_email: string
}

export interface MediaData {
    originalTitle?: string
    originalName?: string
    keywords: Array<Keyword>
    contentRatings: ContentRatings
    [key: string]: any
}

export interface Keyword {
    name: string
}

export interface ContentRating {
    iso_3116_1: string
    rating: string
}

export interface ContentRatings {
    results: ContentRating[]
}

export interface PostData {
    mediaType: string
    seasons?: number[]
}
