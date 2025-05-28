import { config } from "../config"
import logger from "../utils/logger"

// Create headers for Overseerr API requests
const headers = {
    "X-Api-Key": config.overseerr_api_token,
    accept: "application/json",
    "Content-Type": "application/json",
}

/**
 * Fetch data from Overseerr API
 */
export const fetchFromOverseerr = async (endpoint: string): Promise<any> => {
    const url = new URL(endpoint, config.overseerr_url)
    const response = await fetch(url, { headers: headers })

    if (!response.ok || response.status !== 200) {
        throw new Error(`could not retrieve data from Overseerr: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
}

/**
 * Approve a request in Overseerr
 */
export const approveRequest = async (requestId: string): Promise<void> => {
    try {
        const url = new URL(`/api/v1/request/${requestId}/approve`, config.overseerr_url)
        const response = await fetch(url, { method: "POST", headers: headers })

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`)
        }

        logger.info(`Request ID ${requestId} approved successfully`)
    } catch (error) {
        logger.error(`Error approving request: ${error}`)
    }
}

/**
 * Apply configuration to a request in Overseerr
 */
export const applyConfig = async (requestId: string, postData: Record<string, any>): Promise<void> => {
    try {
        const url = new URL(`/api/v1/request/${requestId}`, config.overseerr_url)
        const response = await fetch(url, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(postData),
        })

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`)
        }

        logger.info(`Configuration applied to request ID ${requestId}`)
    } catch (error) {
        logger.error(`Error applying configuration: ${error}`)
    }
}
