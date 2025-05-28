import logger from "../utils/logger"
import { normalizeToArray, isObject, isObjectArray, buildDebugLogMessage } from "../utils/helpers"
import type { Webhook, MediaData, Filter, Condition, Keyword, ContentRatings } from "../types"

/**
 * Optimized function to match values
 * Uses Set for faster lookups and early returns for better performance
 *
 * @param filterValue - The value to match against
 * @param dataValue - The data to check
 * @param required - If true, requires exact match; if false, allows partial match (include behavior)
 */
export const matchValue = (filterValue: any, dataValue: any, required = false): boolean => {
    // Convert filter values to a Set of lowercase strings for faster lookups
    const filterValues = new Set(normalizeToArray(filterValue))

    // Handle object data values
    if (isObject(dataValue)) {
        // Extract all values from the object for matching
        const allValues: string[] = []

        for (const value of Object.values(dataValue)) {
            if (isObjectArray(value)) {
                // For arrays of objects, extract all values from each object
                for (const item of value as any[]) {
                    for (const field of Object.values(item)) {
                        const fieldStr = String(field).toLowerCase()

                        // Early return for performance if we find a match
                        if (required) {
                            // For required, we need an exact match
                            if (filterValues.has(fieldStr)) return true
                        } else {
                            // For include (default behavior), we check for partial matches
                            for (const filterVal of filterValues) {
                                if (fieldStr.includes(filterVal)) return true
                            }
                        }

                        allValues.push(fieldStr)
                    }
                }
            } else {
                const valueStr = String(value).toLowerCase()

                // Early return for performance if we find a match
                if (required) {
                    // For required, we need an exact match
                    if (filterValues.has(valueStr)) return true
                } else {
                    // For include (default behavior), we check for partial matches
                    for (const filterVal of filterValues) {
                        if (valueStr.includes(filterVal)) return true
                    }
                }

                allValues.push(valueStr)
            }
        }

        // If we haven't returned yet, check all collected values
        if (required) {
            // For required, we need an exact match with any value
            return allValues.some((val) => filterValues.has(val))
        } else {
            // For include (default behavior), we check for partial matches
            return allValues.some((val) => {
                for (const filterVal of filterValues) {
                    if (val.includes(filterVal)) return true
                }
                return false
            })
        }
    }

    // Handle array of objects
    if (isObjectArray(dataValue)) {
        for (const item of dataValue as any[]) {
            for (const field of Object.values(item)) {
                const fieldStr = String(field).toLowerCase()

                // Early return for performance
                if (required) {
                    // For required, we need an exact match
                    if (filterValues.has(fieldStr)) return true
                } else {
                    // For include (default behavior), we check for partial matches
                    for (const filterVal of filterValues) {
                        if (fieldStr.includes(filterVal)) return true
                    }
                }
            }
        }
        return false
    }

    // Handle simple string value
    const dataStr = String(dataValue).toLowerCase()
    if (required) {
        // For required, we need an exact match
        return filterValues.has(dataStr)
    } else {
        // For include (default behavior), we check for partial matches
        for (const filterVal of filterValues) {
            if (dataStr.includes(filterVal)) return true
        }
        return false
    }
}

/**
 * Specialized function to match keywords for better performance
 * Directly processes the keywords array without using the generic matchValue function
 *
 * - require: Requires exact match of the keyword
 * - include: Allows partial match (default behavior for string/array conditions)
 * - exclude: Excludes if there's a partial match
 */
export const matchKeywords = (keywords: Array<Keyword>, filterCondition: Condition): boolean => {
    // Extract keyword names for faster matching
    const keywordNames = keywords.map((k) => k.name.toLowerCase())

    if (typeof filterCondition === "object" && filterCondition !== null) {
        // Check for required keywords (exact match)
        if ("require" in filterCondition && filterCondition.require) {
            const requiredValues = new Set(normalizeToArray(filterCondition.require))
            // For required, we need an exact match with any keyword
            const hasRequired = keywordNames.some((name) => requiredValues.has(name))
            if (!hasRequired) return false
        }

        // Check for included keywords (partial match)
        if ("include" in filterCondition && filterCondition.include) {
            const includeValues = normalizeToArray(filterCondition.include)
            // For include, we check if any keyword contains any of the include values
            const hasIncluded = keywordNames.some((name) => includeValues.some((val) => name.includes(val)))
            if (!hasIncluded) return false
        }

        // Check for excluded keywords
        if ("exclude" in filterCondition && filterCondition.exclude) {
            const excludeValues = normalizeToArray(filterCondition.exclude)
            // For exclude, we check if any keyword contains any of the exclude values
            const hasExcluded = keywordNames.some((name) => excludeValues.some((val) => name.includes(val)))
            if (hasExcluded) return false
        }

        return true
    }

    // Simple string or array condition - behaves like include (partial match)
    const filterValues = normalizeToArray(filterCondition)
    return keywordNames.some((name) => filterValues.some((val) => name.includes(val)))
}

/**
 * Specialized function to match content ratings for better performance
 *
 * - require: Requires exact match of the rating
 * - include: Allows partial match (default behavior for string/array conditions)
 * - exclude: Excludes if there's a partial match
 */
export const matchContentRatings = (contentRatings: ContentRatings, filterCondition: Condition): boolean => {
    if (!contentRatings || !contentRatings.results || contentRatings.results.length === 0) {
        return false
    }

    // Extract all ratings for faster matching
    const ratings: string[] = contentRatings.results.map((r: any) => r.rating.toLowerCase())

    if (typeof filterCondition === "object" && filterCondition !== null) {
        // Check for required ratings (exact match)
        if ("require" in filterCondition && filterCondition.require) {
            const requiredValues = new Set(normalizeToArray(filterCondition.require))
            // For required, we need an exact match with any rating
            const hasRequired = ratings.some((rating: string) => requiredValues.has(rating))
            if (!hasRequired) return false
        }

        // Check for included ratings (partial match)
        if ("include" in filterCondition && filterCondition.include) {
            const includeValues = normalizeToArray(filterCondition.include)
            // For include, we check if any rating contains any of the include values
            const hasIncluded = ratings.some((rating: string) => includeValues.some((val) => rating.includes(val)))
            if (!hasIncluded) return false
        }

        // Check for excluded ratings
        if ("exclude" in filterCondition && filterCondition.exclude) {
            const excludeValues = normalizeToArray(filterCondition.exclude)
            // For exclude, we check if any rating contains any of the exclude values
            const hasExcluded = ratings.some((rating: string) => excludeValues.some((val) => rating.includes(val)))
            if (hasExcluded) return false
        }

        return true
    }

    // Simple string or array condition - behaves like include (partial match)
    const filterValues = normalizeToArray(filterCondition)
    return ratings.some((rating: string) => filterValues.some((val) => rating.includes(val)))
}

/**
 * Find matching instances for a webhook based on filters
 * Prioritizes checking keywords and content ratings before other properties
 */
export const findInstances = (webhook: Webhook, data: MediaData, filters: Filter[]): string | string[] | null => {
    try {
        const matchingFilter = filters.find(({ media_type, is_4k, conditions }) => {
            if (media_type !== webhook.media.media_type) return false
            if (is_4k === false && webhook.media.status !== "PENDING") return false
            if (is_4k === true && webhook.media.status4k !== "PENDING") return false

            if (!conditions || Object.keys(conditions).length === 0) return true

            // Prioritize certain keys for better performance
            const priorityKeys = ["keywords", "contentRatings", "max_seasons"]

            for (const priorityKey of priorityKeys) {
                if (priorityKey in conditions) {
                    const value = conditions[priorityKey]

                    if (priorityKey === "keywords") {
                        if (!data.keywords) {
                            logger.debug(`Filter check skipped - Keywords not found in data`)
                            return false
                        }

                        if (!matchKeywords(data.keywords, value as Condition)) {
                            logger.debug(`Filter check for keywords did not match.`)
                            return false
                        }

                        if (logger.isDebugEnabled()) {
                            logger.debug(
                                buildDebugLogMessage("Filter check:", {
                                    Field: priorityKey,
                                    "Filter value": value,
                                    "Request value": "Keywords array (matched)",
                                })
                            )
                        }
                    } else if (priorityKey === "contentRatings") {
                        if (!data.contentRatings) {
                            logger.debug(`Filter check skipped - Content ratings not found in data`)
                            return false
                        }

                        // Type assertion to ensure value is treated as Condition
                        if (!matchContentRatings(data.contentRatings, value as Condition)) {
                            logger.debug(`Filter check for content ratings did not match.`)
                            return false
                        }

                        if (logger.isDebugEnabled()) {
                            logger.debug(
                                buildDebugLogMessage("Filter check:", {
                                    Field: priorityKey,
                                    "Filter value": value,
                                    "Request value": "Content ratings array (matched)",
                                })
                            )
                        }
                    } else if (priorityKey === "max_seasons" && webhook.extra) {
                        const requestedSeasons = webhook.extra
                            .find((item: any) => item.name === "Requested Seasons")
                            ?.value?.split(",")

                        if (requestedSeasons && value && requestedSeasons.length > value) {
                            return false
                        }
                    }
                }
            }

            for (const [key, value] of Object.entries(conditions)) {
                // Skip priority keys that were already processed
                if (priorityKeys.includes(key)) {
                    continue
                }

                const requestValue = data[key] || webhook.request?.[key as keyof typeof webhook.request]
                if (!requestValue) {
                    logger.debug(`Filter check skipped - Key "${key}" not found in webhook or data`)
                    return false
                }

                if (logger.isDebugEnabled()) {
                    logger.debug(
                        buildDebugLogMessage("Filter check:", {
                            Field: key,
                            "Filter value": value,
                            "Request value": requestValue,
                        })
                    )
                }

                if (typeof value === "object" && value !== null) {
                    // Check for required values (exact match)
                    if ("require" in value && value.require) {
                        if (!matchValue(value.require, requestValue, true)) {
                            logger.debug(`Filter check for required key "${key}" did not match.`)
                            return false
                        }
                    }

                    // Check for included values (partial match)
                    if ("include" in value && value.include) {
                        if (!matchValue(value.include, requestValue, false)) {
                            logger.debug(`Filter check for included key "${key}" did not match.`)
                            return false
                        }
                    }

                    // Check for excluded values
                    if ("exclude" in value && value.exclude) {
                        if (matchValue(value.exclude, requestValue, false)) {
                            logger.debug(`Filter check for excluded key "${key}" did not match.`)
                            return false
                        }
                    }
                } else {
                    // Simple string or array condition - behaves like include (partial match)
                    if (!matchValue(value, requestValue, false)) {
                        logger.debug(`Filter check for key "${key}" did not match.`)
                        return false
                    }
                }
            }
            return true
        })

        if (!matchingFilter) {
            logger.info("No matching filter found for the current webhook")
            return null
        }

        logger.info(`Found matching filter at index ${filters.indexOf(matchingFilter)}`)
        return matchingFilter.apply
    } catch (error) {
        logger.error(`Error finding matching filter: ${error}`)
        return null
    }
}
