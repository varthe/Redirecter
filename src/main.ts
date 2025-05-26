import logger from "./utils/logger"
import { isWebhook } from "./utils/helpers"
import { handleWebhook, createResponse } from "./services/webhook"

const PORT = process.env.PORT || 8481
logger.info(`Redirecterr listening on port ${PORT}`)

Bun.serve({
    port: Number(PORT),
    async fetch(req: Request): Promise<Response> {
        const url = new URL(req.url)

        if (req.method !== "POST" || url.pathname !== "/webhook") {
            return createResponse("error", "Invalid URL. Use the /webhook endpoint", 400)
        }

        try {
            const webhook = await req.json()

            if (!isWebhook(webhook)) {
                return createResponse(
                    "error",
                    "Invalid webhook structure. Ensure 'media' and 'request' objects are present",
                    400
                )
            }

            // Process the webhook
            return handleWebhook(webhook)
        } catch (error) {
            return createResponse("error", `Error processing webhook: ${error}`, 500)
        }
    },
})
