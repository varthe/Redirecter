import logger from "../logger"
import { approveRequest, fetchFromOverseerr } from "./api"
import { isWebhook } from "./helpers"
import type { Webhook } from "./types"

const PORT = process.env.PORT || 3184

logger.info(`Redirecterr listening on port ${PORT}`)

const handleWebhook = async (webhook: Webhook): Response => {
    if (webhook.notificationType === "TEST_NOTIFICATION") {
        return sendResponse("success", "Test notification received", 200)
    }

    const { media, request } = webhook

    if (media.type === "music") {
        await approveRequest(request.id)
        return sendResponse("success", "Music request approved", 200)
    }

    const data = await fetchFromOverseerr(`/api/v1/${media.type}/${media.tmdbId}`)
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
