export interface Webhook {
    notificationType: string
    media: Media
    request: Request
}

interface Media {
    type: string
    tmdbId: string
    status: string
    status4k: string
}

interface Request {
    id: string
    username: string
    userEmail: string
}

interface ConditionValueObject {
    exclude?: string | string[]
    require?: string | string[]
}

type Condition = string | string[] | ConditionValueObject

interface FilterCondition {
    [key: string]: Condition // For dynamic condition keys like "tag", "language" etc.
}

interface Filter {
    media_type: "movie" | "tv"
    is_not_4k?: boolean
    is_4k?: boolean
    conditions?: FilterCondition
    apply: string | string[]
}

interface InstanceConfig {
    server_id: number
    root_folder: string
    quality_profile_id?: number // Optional based on your schema not explicitly requiring it at this level
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
