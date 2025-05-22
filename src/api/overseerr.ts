import { config } from "../config"
import logger from "../utils/logger"

// Create headers for Overseerr API requests
const createHeaders = (): Headers => {
    const headers = new Headers()
    headers.append("X-Api-Key", config.overseerr_api_token)
    headers.append("accept", "application/json")
    headers.append("Content-Type", "application/json")
    return headers
}

/**
 * Fetch data from Overseerr API
 */
export const fetchFromOverseerr = async (endpoint: string): Promise<any> => {
    const url = new URL(endpoint, config.overseerr_url)
    const response = await fetch(url, { headers: createHeaders() })

    if (!response.ok || response.status !== 200) {
        throw new Error(`could not retrieve data from Overseerr: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
}

/**
 * Test connection to Overseerr API
 */
export const testConnection = async (): Promise<void> => {
    try {
        await fetchFromOverseerr("/api/v1/auth/me")
        logger.info("Successfully connected to Overseerr API")
    } catch (error) {
        let errorMessage = "An unknown error occurred"
        if (error instanceof Error) errorMessage = error.message
        else if (typeof error === "string") errorMessage = error

        logger.error(`Could not reach Overseerr: ${errorMessage}`)
    }
}

/**
 * Approve a request in Overseerr
 */
export const approveRequest = async (requestId: string): Promise<void> => {
    try {
        const url = new URL(`/api/v1/request/${requestId}/approve`, config.overseerr_url)
        const response = await fetch(url, { method: "POST", headers: createHeaders() })

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
            headers: createHeaders(),
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
