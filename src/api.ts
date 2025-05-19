import { config } from "./configLoader"
import logger from "./logger"

const headers = new Headers()
headers.append("X-Api-Key", config.overseerr_api_token)
headers.append("accept", "application/json")
headers.append("Content-Type", "application/json")

export const fetchFromOverseerr = async (endpoint: string): Promise<any> => {
    const url = new URL(endpoint, config.overseerr_url)
    const response = await fetch(url, { headers: headers })

    if (!response.ok || response.status !== 200) {
        throw new Error(`could not retrieve data from Overseerr: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
}

export const approveRequest = async (requestId: string) => {
    try {
        const url = new URL(`/api/v1/request/${requestId}/approve`, config.overseerr_url)
        const response = await fetch(url, { method: "POST", headers: headers })

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`)
        }
    } catch (error) {
        logger.error(`Error approving request: ${error}`)
    }
}
