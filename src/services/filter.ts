import logger from "../utils/logger"
import { normalizeToArray, isObject, isObjectArray, buildDebugLogMessage } from "../utils/helpers"
import type { Webhook, MediaData, Filter, Condition, Keyword, ContentRatings } from "../types"

/**
 * Matches filter values against arbitrary data structures.
 * - required=true: exact match against any extracted string
 * - required=false: substring match against any extracted string
 */
export const matchValue = (filterValue: any, dataValue: any, required = false): boolean => {
	const filterValues = new Set(normalizeToArray(filterValue))

	const check = (s: string): boolean => {
		if (required) return filterValues.has(s)
		for (const f of filterValues) if (s.includes(f)) return true
		return false
	}

	// Object: scan values (including nested objects, arrays of objects, and arrays of primitives)
	if (isObject(dataValue)) {
		const allValues: string[] = []

		for (const value of Object.values(dataValue)) {
			if (isObject(value)) {
				const values = Object.values(value as Record<PropertyKey, unknown>).map((x) => String(x).toLowerCase())
				for (const v of values) if (check(v)) return true
				allValues.push(...values)
			} else if (isObjectArray(value)) {
				for (const item of value as any[]) {
					for (const field of Object.values(item)) {
						const s = String(field).toLowerCase()
						if (check(s)) return true
						allValues.push(s)
					}
				}
			} else if (Array.isArray(value)) {
				for (const el of value) {
					const s = String(el).toLowerCase()
					if (check(s)) return true
					allValues.push(s)
				}
			} else {
				const s = String(value).toLowerCase()
				if (check(s)) return true
				allValues.push(s)
			}
		}

		return allValues.some(check)
	}

	// Array of objects
	if (isObjectArray(dataValue)) {
		for (const item of dataValue as any[]) {
			for (const field of Object.values(item)) {
				const s = String(field).toLowerCase()
				if (check(s)) return true
			}
		}
		return false
	}

	// Array of primitives
	if (Array.isArray(dataValue)) {
		for (const el of dataValue) {
			const s = String(el).toLowerCase()
			if (check(s)) return true
		}
		return false
	}

	// Primitive
	return check(String(dataValue).toLowerCase())
}

/**
 * Specialized keyword matcher: handles require/include/exclude directly on keyword names.
 */
export const matchKeywords = (keywords: Array<Keyword>, filterCondition: Condition): boolean => {
	const names = keywords.map((k) => k.name.toLowerCase())

	if (typeof filterCondition === "object" && filterCondition !== null) {
		if ("require" in filterCondition && filterCondition.require) {
			const req = new Set(normalizeToArray(filterCondition.require))
			if (!names.some((n) => req.has(n))) return false
		}

		if ("include" in filterCondition && filterCondition.include) {
			const inc = normalizeToArray(filterCondition.include)
			if (!names.some((n) => inc.some((v) => n.includes(v)))) return false
		}

		if ("exclude" in filterCondition && filterCondition.exclude) {
			const exc = normalizeToArray(filterCondition.exclude)
			if (names.some((n) => exc.some((v) => n.includes(v)))) return false
		}

		return true
	}

	const vals = normalizeToArray(filterCondition)
	return names.some((n) => vals.some((v) => n.includes(v)))
}

/**
 * Specialized content rating matcher: handles require/include/exclude on rating strings.
 */
export const matchContentRatings = (contentRatings: ContentRatings, filterCondition: Condition): boolean => {
	if (!contentRatings || !contentRatings.results || contentRatings.results.length === 0) return false

	const ratings: string[] = contentRatings.results.map((r: any) => String(r.rating).toLowerCase())

	if (typeof filterCondition === "object" && filterCondition !== null) {
		if ("require" in filterCondition && filterCondition.require) {
			const req = new Set(normalizeToArray(filterCondition.require))
			if (!ratings.some((r) => req.has(r))) return false
		}

		if ("include" in filterCondition && filterCondition.include) {
			const inc = normalizeToArray(filterCondition.include)
			if (!ratings.some((r) => inc.some((v) => r.includes(v)))) return false
		}

		if ("exclude" in filterCondition && filterCondition.exclude) {
			const exc = normalizeToArray(filterCondition.exclude)
			if (ratings.some((r) => exc.some((v) => r.includes(v)))) return false
		}

		return true
	}

	const vals = normalizeToArray(filterCondition)
	return ratings.some((r) => vals.some((v) => r.includes(v)))
}

/**
 * Finds the first filter that matches this webhook + media data and returns its `apply` target.
 * Prioritizes keys: keywords, contentRatings, max_seasons.
 */
export const findInstances = (webhook: Webhook, data: MediaData, filters: Filter[]): string | string[] | null => {
	try {
		const matchingFilter = filters.find(({ media_type, is_4k, conditions }) => {
			if (media_type !== webhook.media.media_type) return false
			if (is_4k === false && webhook.media.status !== "PENDING") return false
			if (is_4k === true && webhook.media.status4k !== "PENDING") return false

			if (!conditions || Object.keys(conditions).length === 0) return true

			const priorityKeys = ["keywords", "contentRatings", "max_seasons"]

			for (const priorityKey of priorityKeys) {
				if (!(priorityKey in conditions)) continue
				const value = (conditions as any)[priorityKey]

				if (priorityKey === "keywords") {
					if (!data.keywords) return false
					if (!matchKeywords(data.keywords, value as Condition)) return false

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
					if (!data.contentRatings) return false
					if (!matchContentRatings(data.contentRatings, value as Condition)) return false

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
					const requestedSeasons = webhook.extra.find((item: any) => item.name === "Requested Seasons")?.value?.split(",")
					const max = typeof value === "number" ? value : Number.parseInt(String(value), 10)
					if (Number.isFinite(max) && requestedSeasons && requestedSeasons.length > max) return false
				}
			}

			for (const [key, value] of Object.entries(conditions)) {
				if (priorityKeys.includes(key)) continue

				const requestValue = (data as any)[key] ?? (webhook.request ? (webhook.request as any)[key] : undefined)

				if (requestValue === undefined || requestValue === null) {
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
					if ("require" in value && (value as any).require) {
						if (!matchValue((value as any).require, requestValue, true)) {
							logger.debug(`Filter check for required key "${key}" failed.`)
							return false
						}
					}

					if ("include" in value && (value as any).include) {
						if (!matchValue((value as any).include, requestValue, false)) {
							logger.debug(`Filter check for included key "${key}" failed.`)
							return false
						}
					}

					if ("exclude" in value && (value as any).exclude) {
						if (matchValue((value as any).exclude, requestValue, false)) {
							logger.debug(`Filter check for excluded key "${key}" matched an excluded value.`)
							return false
						}
					}
				} else {
					if (!matchValue(value, requestValue, false)) {
						logger.debug(`Filter check for key "${key}" failed.`)
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
