export interface Webhook {
    notification_type: string
    media: Media
    request: Request
    extra?: Array<any>
}

interface Media {
    media_type: string
    tmdbId: string
    status: string
    status4k: string
}

interface Request {
    request_id: string
    requestedBy_username: string
    requestedBy_email: string
}

export interface ConditionValueObject {
    include?: string | string[]
    exclude?: string | string[]
    require?: string | string[]
}

export type Condition = string | string[] | ConditionValueObject

interface FilterCondition {
    [key: string]: Condition // For dynamic condition keys like "tag", "language" etc.
}

export interface Filter {
    media_type: "movie" | "tv"
    is_not_4k?: boolean
    is_4k?: boolean
    conditions?: FilterCondition
    apply: string | string[]
}

interface InstanceConfig {
    server_id: number
    root_folder: string
    quality_profile_id?: number
    approve?: boolean
}

export interface Config {
    overseerr_url: string
    overseerr_api_token: string
    approve_on_no_match?: boolean // Optional as not explicitly in required top level
    instances: {
        [key: string]: InstanceConfig // For dynamic instance names
    }
    filters: Filter[]
}

export interface PostData {
    mediaType: string
    seasons?: number[]
}

export interface MediaData {
    originalTitle?: string
    originalName?: string
    keywords: Array<Keyword>
    contentRatings: ContentRatings
    [key: string]: any
}

interface Keyword {
    name: string
}

interface ContentRating {
    iso_3116_1: string
    rating: string
}

interface ContentRatings {
    results: ContentRating[]
}
