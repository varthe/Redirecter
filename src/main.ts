import logger from "./utils/logger"
import { testConnection } from "./api/overseerr"
import { isWebhook } from "./utils/helpers"
import { handleWebhook, createResponse } from "./services/webhook"

// Test connection to Overseerr API on startup
await testConnection()

// Set up server port
const PORT = process.env.PORT || 8481
logger.info(`Redirecterr listening on port ${PORT}`)

// Start the server
Bun.serve({
    port: Number(PORT),
    async fetch(req: Request): Promise<Response> {
        const url = new URL(req.url)

        // Only accept POST requests to /webhook endpoint
        if (req.method !== "POST" || url.pathname !== "/webhook") {
            return createResponse("error", "Invalid URL. Use the /webhook endpoint", 400)
        }

        try {
            const webhook = await req.json()

            // Validate webhook structure
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
