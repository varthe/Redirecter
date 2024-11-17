const { findMatchingInstances } = require("./main")
const { movieWebhook, showWebhook, movieGladiator2Data, showArcaneData } = require("./testData")
const assert = require("assert")

const sampleFilters = [
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
        const result = findMatchingInstances(movieWebhook, movieGladiator2Data, sampleFilters)
        assert.strictEqual(
            result,
            "radarr",
            "Expected filter to match for 'Action' genre and no excluded 'anime' keyword"
        )
    })

    it("Exclude movie with keyword", () => {
        const data = { ...movieGladiator2Data, keywords: [{ id: 12345, name: "anime" }] }
        const result = findMatchingInstances(movieWebhook, data, sampleFilters)
        assert.strictEqual(result, null, "Expected filter to exclude due to 'anime' keyword")
    })

    it("Match show with correct language and genres, excluding certain keywords", () => {
        const result = findMatchingInstances(showWebhook, showArcaneData, sampleFilters)
        assert.strictEqual(
            result,
            "sonarr2",
            "Expected filter to match for 'Animation' genre and exclude 'intense', 'dramatic' keywords"
        )
    })

    it("Exclude show based on 'intense' keyword", () => {
        const data = { ...showArcaneData, keywords: [{ id: 321464, name: "intense" }] }
        const result = findMatchingInstances(showWebhook, data, sampleFilters)
        assert.strictEqual(result, null, "Expected filter to exclude due to 'intense' keyword")
    })

    it("Match show based on genre and keyword", () => {
        const data = { ...showArcaneData, keywords: [{ id: 288793, name: "power" }] }
        const result = findMatchingInstances(showWebhook, data, sampleFilters)
        assert.strictEqual(
            result,
            "sonarr2",
            "Expected filter to match for 'Sci-Fi & Fantasy' genre and 'power' keyword"
        )
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
        const result = findMatchingInstances(movieWebhook, data, sampleFilters)
        assert.strictEqual(result, "radarr3", "Expected filter to match for '16' content rating")
    })

    it("Handle non-matching cases gracefully", () => {
        const data = { ...movieGladiator2Data, originalLanguage: "fr" }
        const result = findMatchingInstances(movieWebhook, data, sampleFilters)
        assert.strictEqual(result, null, "Expected no filter match due to non-matching language")
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
        const result = findMatchingInstances(showWebhook, data, sampleFilters)
        assert.strictEqual(result, "sonarr2", "Expected filter to match for mixed types with genres and keywords")
    })
})
