import type { Webhook } from "./types"

const isObject = (value: any): boolean => typeof value === "object" && value !== null
const isObjectArray = (value: any): boolean => Array.isArray(value) && value.some((item: any) => isObject(item))

export const isWebhook = (obj: any): obj is Webhook => typeof obj === "object" && "media" in obj && "request" in obj
