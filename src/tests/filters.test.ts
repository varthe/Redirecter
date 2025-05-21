import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { findInstances } from "../services/filter"
import { movieWebhook, showWebhook, movieGladiator2Data, showArcaneData } from "../../testData"
import type { Filter } from "../types"

const sampleFilters: Filter[] = [
    {
        media_type: "movie",
        conditions: {
            originalLanguage: "en",
            genres: "Action",
            keywords: { exclude: "anime" },
        },
        apply: "radarr",
    },
    {
        media_type: "movie",
        conditions: {
            keywords: "epic",
            genres: ["Adventure", "Drama"],
            originalLanguage: "pl",
        },
        apply: "radarr2",
    },
    {
        media_type: "movie",
        conditions: {
            contentRatings: "16",
        },
        apply: "radarr3",
    },
    {
        media_type: "tv",
        conditions: {
            originalLanguage: "en",
            keywords: { exclude: ["intense", "dramatic", "power"] },
            genres: "Animation",
        },
        apply: "sonarr",
    },
    {
        media_type: "tv",
        conditions: {
            genres: ["Sci-Fi & Fantasy", "Animation"],
            keywords: ["power", "dramatic"],
        },
        apply: "sonarr2",
    },
]

describe("Filter Matching Tests", () => {
    it("Match movie with genre and exclude keyword filter", () => {
        const result = findInstances(movieWebhook, movieGladiator2Data, sampleFilters)
        expect(result).toBe("radarr")
    })

    it("Exclude movie with keyword", () => {
        const data = { 
            ...movieGladiator2Data, 
            keywords: [{ id: 12345, name: "anime" }] 
        }
        const result = findInstances(movieWebhook, data, sampleFilters)
        expect(result).toBeNull()
    })

    it("Match show with correct language and genres, excluding certain keywords", () => {
        const result = findInstances(showWebhook, showArcaneData, sampleFilters)
        expect(result).toBe("sonarr2")
    })

    it("Exclude show based on 'intense' keyword", () => {
        const data = { 
            ...showArcaneData, 
            keywords: [{ id: 321464, name: "intense" }] 
        }
        const result = findInstances(showWebhook, data, sampleFilters)
        expect(result).toBeNull()
    })

    it("Match show based on genre and keyword", () => {
        const data = { 
            ...showArcaneData, 
            keywords: [{ id: 288793, name: "power" }] 
        }
        const result = findInstances(showWebhook, data, sampleFilters)
        expect(result).toBe("sonarr2")
    })

    it("Match movie based on age rating", () => {
        const data = {
            ...showArcaneData,
            contentRatings: {
                results: [
                    { descriptors: [], iso_3166_1: "US", rating: "TV-14" },
                    { descriptors: [], iso_3166_1: "AU", rating: "MA 15+" },
                    { descriptors: [], iso_3166_1: "RU", rating: "18+" },
                    { descriptors: [], iso_3166_1: "DE", rating: "16" },
                    { descriptors: [], iso_3166_1: "GB", rating: "15" },
                    { descriptors: [], iso_3166_1: "BR", rating: "16" },
                    { descriptors: [], iso_3166_1: "NL", rating: "12" },
                    { descriptors: [], iso_3166_1: "PT", rating: "16" },
                    { descriptors: [], iso_3166_1: "ES", rating: "16" },
                ],
            },
            originalLanguage: "jp",
        }
        const result = findInstances(movieWebhook, data, sampleFilters)
        expect(result).toBe("radarr3")
    })

    it("Handle non-matching cases gracefully", () => {
        const data = { ...movieGladiator2Data, originalLanguage: "fr" }
        const result = findInstances(movieWebhook, data, sampleFilters)
        expect(result).toBeNull()
    })

    it("Match a complex filter with mixed types (strings, arrays)", () => {
        const data = {
            ...showArcaneData,
            originalLanguage: "en",
            genres: [
                { id: 16, name: "Animation" },
                { id: 10759, name: "Action & Adventure" },
            ],
            keywords: [
                { id: 311315, name: "dramatic" },
                { id: 273967, name: "war" },
            ],
        }
        const result = findInstances(showWebhook, data, sampleFilters)
        expect(result).toBe("sonarr2")
    })
})
