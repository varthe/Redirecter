import fs from "fs"
import yaml from "js-yaml"
import Ajv, { type ErrorObject, type Schema } from "ajv"
import logger from "./logger"
import type { Config } from "./types"
import { fetchFromOverseerr } from "./api"

const ajv = new Ajv({ allErrors: true })

const yamlFilePath = process.argv[3] || "./config.yaml"

const schema: Schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    properties: {
        overseerr_url: {
            type: "string",
            minLength: 1,
        },
        overseerr_api_token: {
            type: "string",
            minLength: 1,
        },
        approve_on_no_match: {
            type: "boolean",
        },
        instances: {
            type: "object",
            patternProperties: {
                ".*": {
                    type: "object",
                    properties: {
                        server_id: {
                            type: "number",
                        },
                        root_folder: {
                            type: "string",
                            minLength: 1,
                        },
                        quality_profile_id: {
                            type: "number",
                        },
                        approve: {
                            type: "boolean",
                        },
                    },
                    required: ["server_id", "root_folder"],
                },
            },
            additionalProperties: false,
        },
        filters: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    media_type: {
                        type: "string",
                        enum: ["movie", "tv"],
                    },
                    is_not_4k: {
                        type: "boolean",
                    },
                    is_4k: {
                        type: "boolean",
                    },
                    conditions: {
                        type: "object",
                        additionalProperties: {
                            anyOf: [
                                { type: "string" },
                                {
                                    type: "array",
                                    items: { type: "string" },
                                    minItems: 1,
                                },
                                {
                                    type: "object",
                                    properties: {
                                        exclude: {
                                            anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
                                        },
                                    },
                                    required: ["exclude"],
                                    additionalProperties: false,
                                },
                                {
                                    type: "object",
                                    properties: {
                                        require: {
                                            anyOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
                                        },
                                    },
                                    required: ["require"],
                                    additionalProperties: false,
                                },
                            ],
                        },
                    },
                    apply: {
                        anyOf: [
                            { type: "string" },
                            {
                                type: "array",
                                items: { type: "string" },
                                minItems: 1,
                            },
                        ],
                    },
                },
                required: ["media_type", "apply"],
            },
        },
    },
    required: ["overseerr_url", "overseerr_api_token", "instances", "filters"],
}

const formatErrors = (errors: ErrorObject[] | null | undefined): string => {
    if (!errors) return "Unknown validation error"

    return errors
        .map((error) => {
            const path = error.instancePath || "config"
            return `Error at "${path}": ${error.message || "Validation issue"}`
        })
        .join("\n")
}

const validate = ajv.compile<Config>(schema)

const loadConfig = async (): Promise<Config> => {
    try {
        if (!fs.existsSync(yamlFilePath)) {
            logger.error(`Configuration file not found at: ${yamlFilePath}`)
            process.exit(1)
        }

        const fileContents = fs.readFileSync(yamlFilePath, "utf8")
        const config = yaml.load(fileContents)

        if (!validate(config)) {
            throw new Error(`\n${formatErrors(validate.errors)}`)
        }

        if (logger.isDebugEnabled()) {
            logger.debug(`Loaded config: ${JSON.stringify(config, null, 2)}`)
        }

        await fetchFromOverseerr("/api/v1/auth/me")

        return config
    } catch (error: any) {
        let errorMessage = "An unknown error occurred"
        if (error instanceof Error) errorMessage = error.message
        else if (typeof error === "string") errorMessage = error

        logger.error(`Error loading config: ${errorMessage}`)
        process.exit(1)
    }
}

export const config = await loadConfig()
