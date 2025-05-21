import type { stringWidth } from "bun"
import logger from "../logger"
import { approveRequest, fetchFromOverseerr, testConnection } from "./api"
import { isWebhook } from "./helpers"
import type { Webhook, MediaData, Filter, Condition, ConditionValueObject } from "./types"

await testConnection()

const PORT = process.env.PORT || 8481
logger.info(`Redirecterr listening on port ${PORT}`)

const handleWebhook = async (webhook: Webhook): Promise<Response> => {
    if (logger.isDebugEnabled()) {
        logger.debug(`Received webhook event:\n${JSON.stringify(webhook, null, 2)}`)
    }

    if (webhook.notification_type === "TEST_NOTIFICATION") {
        return sendResponse("success", "Test notification received", 200)
    }

    const { media, request } = webhook

    if (media.media_type === "music") {
        await approveRequest(request.request_id)
        return sendResponse("success", "Music request approved", 200)
    }

    const data = await fetchFromOverseerr(`/api/v1/${media.media_type}/d`)
    if (logger.isDebugEnabled()) {
        logger.debug(`Fetched media data:\n${JSON.stringify(data, null, 2)}`)
    }
    return sendResponse("success", "Test", 200)
}

Bun.serve({
    port: PORT,
    async fetch(req: Request): Promise<Response> {
        const url = new URL(req.url)

        if (req.method !== "POST" || url.pathname !== "/webhook") {
            return sendResponse("error", "Invalid URL. Use the /webhook endpoint", 400)
        }

        try {
            const webhook = await req.json()

            if (!isWebhook(webhook)) {
                return sendResponse(
                    "error",
                    "Invalid webhook structure. Ensure 'media' and 'request' objects are present",
                    400
                )
            }

            return handleWebhook(webhook)
        } catch (error) {
            return sendResponse("error", `Error processing webhook: ${error}`, 500)
        }
    },
})

const sendResponse = (status: string, message: string, statusCode: number): Response => {
    if (status === "error") logger.error(message)
    else logger.info(message)

    return new Response(JSON.stringify({ status: status, message: message }), {
        headers: { "Content-Type": "application/json" },
        status: statusCode,
    })
}

const findInstances = (webhook: Webhook, data: MediaData, filters: Filter[]) => {
    try {
        const matchingFilter = filters.find(({ media_type, is_not_4k, is_4k, conditions }) => {
            if (!conditions) return true
            if (media_type !== webhook.media.media_type) return false

            if (is_4k && webhook.media.status4k !== "PENDING") return false
            if (is_not_4k && webhook.media.status !== "PENDING") return false

            for (const [key, value] of Object.entries(conditions)) {
                const requestValue = data[key] || webhook.request?.[key as keyof typeof webhook.request]
                if (!requestValue) {
                    logger.debug(`Filter check skipped - Key "${key}" not found in webhook or data`)
                    return false
                }

                if (logger.isDebugEnabled()) {
                    const json = JSON.stringify({
                        Field: key,
                        "Filter value": value,
                        "Request value": requestValue,
                    })
                    logger.debug(`Filter check:\n${json}`)
                }

                switch (key) {
                    case "keywords":
                }
            }
        })
    } catch (error) {}
}

const matchKeywords = (value: string, keywords: Condition) => {
    if (typeof keywords === "object" && keywords !== null) {
        if ("include" in keywords && keywords.include) {
        }

        if ("require" in keywords && keywords.require) {
        }

        if ("exclude" in keywords && keywords.exclude) {
        }
    }
}
