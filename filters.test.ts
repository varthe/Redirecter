import { describe, it } from "bun:test"
import { strictEqual } from "assert"
import { findInstances } from "./src/services/filter"

// --- Webhook and media data ---

const movieWebhook = {
	notification_type: "MEDIA_AUTO_APPROVED",
	media: {
		media_type: "movie",
		tmdbId: "94605",
		tvdbId: "371028",
		status: "PENDING",
		status4k: "UNKNOWN",
	},
	request: {
		request_id: "12",
		requestedBy_email: "email@email.com",
		requestedBy_username: "user2",
		requestedBy_avatar: "",
	},
	extra: [],
} as const

const showWebhook = {
	notification_type: "MEDIA_AUTO_APPROVED",
	media: {
		media_type: "tv",
		tmdbId: "94605",
		tvdbId: "371028",
		status: "PENDING",
		status4k: "UNKNOWN",
	},
	request: {
		request_id: "12",
		requestedBy_email: "email@email.com",
		requestedBy_username: "user2",
		requestedBy_avatar: "",
	},
	extra: [{ name: "Requested Seasons", value: "0, 1, 2" }],
} as const

const movieGladiator2Data = {
	id: 558449,
	adult: false,
	budget: 310000000,
	genres: [
		{ id: 28, name: "Action" },
		{ id: 12, name: "Adventure" },
	],
	originalLanguage: "en",
	originalTitle: "Gladiator II",
	popularity: 1333.762,
	productionCompanies: [
		{
			id: 4,
			name: "Paramount Pictures",
			originCountry: "US",
			logoPath: "/gz66EfNoYPqHTYI4q9UEN4CbHRc.png",
		},
		{
			id: 14440,
			name: "Red Wagon Entertainment",
			originCountry: "US",
			logoPath: "/5QbaGiuxc91D6qf75JZGX6OKXoU.png",
		},
		{
			id: 49325,
			name: "Parkes+MacDonald Image Nation",
			originCountry: "US",
			logoPath: "/R05WCoCJcPWGSDaKaYgx3AeVuR.png",
		},
		{
			id: 221347,
			name: "Scott Free Productions",
			originCountry: "US",
			logoPath: "/6Ry6uNBaa0IbbSs1XYIgX5DkA9r.png",
		},
	],
	productionCountries: [{ iso_3166_1: "US", name: "United States of America" }],
	releaseDate: "2024-11-13",
	revenue: 0,
	spokenLanguages: [{ english_name: "English", iso_639_1: "en", name: "English" }],
	status: "Released",
	title: "Gladiator II",
	video: false,
	voteAverage: 7.315,
	voteCount: 65,
	backdropPath: "/8mjYwWT50GkRrrRdyHzJorfEfcl.jpg",
	homepage: "https://www.gladiator.movie",
	imdbId: "tt9218128",
	runtime: 148,
	tagline: "Prepare to be entertained.",
	collection: {
		id: 1069584,
		name: "Gladiator Collection",
		posterPath: "/r7uyUOB6fmmPumWwHiV7Hn2kUbL.jpg",
		backdropPath: "/eCWJHiezqeSvn0aEt1kPM6Lmlhe.jpg",
	},
	externalIds: {
		facebookId: "GladiatorMovie",
		imdbId: "tt9218128",
		instagramId: "gladiatormovie",
		twitterId: "GladiatorMovie",
	},
	mediaInfo: {
		downloadStatus: [],
		downloadStatus4k: [],
		id: 8,
		mediaType: "movie",
		tmdbId: 558449,
		tvdbId: null,
		imdbId: null,
		status: 3,
		status4k: 1,
		createdAt: "2024-11-14T08:19:49.000Z",
		updatedAt: "2024-11-14T08:19:49.000Z",
		lastSeasonChange: "2024-11-14T08:19:49.000Z",
		mediaAddedAt: null,
		serviceId: 0,
		serviceId4k: null,
		externalServiceId: 2,
		externalServiceId4k: null,
		externalServiceSlug: "558449",
		externalServiceSlug4k: null,
		ratingKey: null,
		ratingKey4k: null,
		requests: [] as any,
		issues: [],
		seasons: [],
		serviceUrl: "http://radarr:7878/movie/558449",
	},
	watchProviders: [],
	keywords: [
		{ id: 6917, name: "epic" },
		{ id: 1394, name: "gladiator" },
		{ id: 1405, name: "roman empire" },
		{ id: 5049, name: "ancient rome" },
		{ id: 9663, name: "sequel" },
		{ id: 307212, name: "evil tyrant" },
		{ id: 317728, name: "sword and sandal" },
		{ id: 320529, name: "sword fighting" },
		{ id: 321763, name: "second part" },
	],
} as const

const showArcaneData = {
	createdBy: [
		{
			id: 2000007,
			credit_id: "62d5e468c92c5d004f0d1201",
			name: "Christian Linke",
			original_name: "Christian Linke",
			gender: 2,
			profile_path: null,
		},
		{
			id: 3299121,
			credit_id: "62d5e46e72c13e062e7196aa",
			name: "Alex Yee",
			original_name: "Alex Yee",
			gender: 2,
			profile_path: null,
		},
	],
	episodeRunTime: [],
	firstAirDate: "2021-11-06",
	genres: [
		{ id: 16, name: "Animation" },
		{ id: 10765, name: "Sci-Fi & Fantasy" },
		{ id: 10759, name: "Action & Adventure" },
		{ id: 9648, name: "Mystery" },
	],
	relatedVideos: [
		{
			site: "YouTube",
			key: "3Svs_hl897c",
			name: "Final Trailer",
			size: 1080,
			type: "Trailer",
			url: "https://www.youtube.com/watch?v=3Svs_hl897c",
		},
		{
			site: "YouTube",
			key: "fXmAurh012s",
			name: "Official Trailer",
			size: 1080,
			type: "Trailer",
			url: "https://www.youtube.com/watch?v=fXmAurh012s",
		},
	],
	homepage: "https://arcane.com",
	id: 94605,
	inProduction: true,
	languages: ["en"],
	lastAirDate: "2024-11-09",
	name: "Arcane",
	networks: [
		{
			id: 213,
			name: "Netflix",
			originCountry: "",
			logoPath: "/wwemzKWzjKYJFfCeiB57q3r4Bcm.png",
		},
	],
	numberOfEpisodes: 18,
	numberOfSeasons: 2,
	originCountry: ["US"],
	originalLanguage: "en",
	originalName: "Arcane",
	tagline: "The hunt is on.",
	overview:
		"Amid the stark discord of twin cities Piltover and Zaun, two sisters fight on rival sides of a war between magic technologies and clashing convictions.",
	popularity: 1437.972,
	productionCompanies: [
		{
			id: 99496,
			name: "Fortiche Production",
			originCountry: "FR",
			logoPath: "/6WTCdsmIH6qR2zFVHlqjpIZhD5A.png",
		},
		{
			id: 124172,
			name: "Riot Games",
			originCountry: "US",
			logoPath: "/sBlhznEktXKBqC87Bsfwpo1YbYR.png",
		},
	],
	productionCountries: [
		{ iso_3166_1: "FR", name: "France" },
		{ iso_3166_1: "US", name: "United States of America" },
	],
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
	status: "Returning Series",
	type: "Scripted",
	voteAverage: 8.8,
	voteCount: 4141,
	backdropPath: "/q8eejQcg1bAqImEV8jh8RtBD4uH.jpg",
	posterPath: "/abf8tHznhSvl9BAElD2cQeRr7do.jpg",
	externalIds: {
		facebookId: "arcaneshow",
		imdbId: "tt11126994",
		instagramId: "arcaneshow",
		tvdbId: 371028,
		twitterId: "arcaneshow",
	},
	keywords: [
		{ id: 2343, name: "magic" },
		{ id: 5248, name: "female friendship" },
		{ id: 7947, name: "war of independence" },
		{ id: 14643, name: "battle" },
		{ id: 41645, name: "based on video game" },
		{ id: 146946, name: "death in family" },
		{ id: 161919, name: "adult animation" },
		{ id: 192913, name: "warrior" },
		{ id: 193319, name: "broken family" },
		{ id: 273967, name: "war" },
		{ id: 288793, name: "power" },
		{ id: 311315, name: "dramatic" },
		{ id: 321464, name: "intense" },
	],
} as const

// --- Tests ---

describe("Filter Matching Tests", () => {
	describe("Advanced Filter Conditions Tests", () => {
		it("Test require condition with missing genre", () => {
			const filters = [
				{
					media_type: "movie" as const,
					conditions: {
						keywords: { include: "epic" },
						genres: { require: ["Action"] },
					},
					apply: "require-test",
				},
			]
			const result = findInstances(
				movieWebhook as any,
				{ ...movieGladiator2Data, genres: [{ id: 12, name: "Adventure" }] } as any,
				filters as any
			)
			strictEqual(result, null)
		})

		it("Test exclude condition with excluded keyword present", () => {
			const additionalFilters = [
				{
					media_type: "movie" as const,
					conditions: {
						keywords: { include: "epic", exclude: "horror" }, // fixed to match expectation
						genres: { require: "Action" },
					},
					apply: "require-include-test",
				},
			]

			const data = {
				...movieGladiator2Data,
				keywords: [...movieGladiator2Data.keywords, { id: 9999, name: "horror" }],
			}

			const result = findInstances(movieWebhook as any, data as any, additionalFilters as any)
			strictEqual(result, null)
		})

		it("Test include condition with partial match", () => {
			const filters = [
				{
					media_type: "movie" as const,
					conditions: { keywords: { include: "epic" } },
					apply: "include-test",
				},
			]
			const result = findInstances(movieWebhook as any, movieGladiator2Data as any, filters as any)
			strictEqual(result, "include-test")
		})

		it("Test simple string condition", () => {
			const simpleFilter = [
				{
					media_type: "movie" as const,
					conditions: { genres: { require: "Action" } }, // require to make intent explicit
					apply: "simple-genre-test",
				},
			]
			const result = findInstances(movieWebhook as any, movieGladiator2Data as any, simpleFilter as any)
			strictEqual(result, "simple-genre-test")
		})

		it("Test array condition", () => {
			const filters = [
				{
					media_type: "movie" as const,
					conditions: { genres: ["Action", "Adventure"] },
					apply: "array-test",
				},
			]
			const result = findInstances(movieWebhook as any, movieGladiator2Data as any, filters as any)
			strictEqual(result, "array-test")
		})

		it("Test object condition with include", () => {
			const includeFilter = [
				{
					media_type: "movie" as const,
					conditions: { genres: { include: "Action" } },
					apply: "include-test",
				},
			]
			const result = findInstances(movieWebhook as any, movieGladiator2Data as any, includeFilter as any)
			strictEqual(result, "include-test")
		})

		it("Test multiple exclude conditions", () => {
			const filters = [
				{
					media_type: "movie" as const,
					conditions: { keywords: { exclude: ["horror", "anime", "romance"] } },
					apply: "exclude-test",
				},
			]
			const result = findInstances(movieWebhook as any, movieGladiator2Data as any, filters as any)
			strictEqual(result, "exclude-test")
		})

		it("Test exclude with one matching condition", () => {
			const filters = [
				{
					media_type: "movie" as const,
					conditions: { keywords: { exclude: ["horror", "fantasy"] } },
					apply: "exclude-test",
				},
			]
			const data = {
				...movieGladiator2Data,
				keywords: [...movieGladiator2Data.keywords, { id: 9999, name: "fantasy" }],
			}
			const result = findInstances(movieWebhook as any, data as any, filters as any)
			strictEqual(result, null)
		})

		it("Test keywords with include, require, and exclude in one condition", () => {
			const filters = [
				{
					media_type: "movie" as const,
					conditions: {
						keywords: { include: "gladiator", require: "epic", exclude: "horror" },
					},
					apply: "complex-keyword-test",
				},
			]
			const result = findInstances(movieWebhook as any, movieGladiator2Data as any, filters as any)
			strictEqual(result, "complex-keyword-test")
		})

		it("Test multiple condition types across different fields", () => {
			const filters = [
				{
					media_type: "movie" as const,
					conditions: {
						keywords: { include: "epic" },
						genres: { require: "Action" },
						originalLanguage: "en",
					},
					apply: "multi-test",
				},
			]
			const result = findInstances(movieWebhook as any, movieGladiator2Data as any, filters as any)
			strictEqual(result, "multi-test")
		})

		it("Test complex condition with all types", () => {
			const filters = [
				{
					media_type: "movie" as const,
					conditions: {
						keywords: { include: "epic", exclude: "horror" },
						genres: { require: "Action" },
						originalLanguage: "en",
					},
					apply: "complex-test",
				},
			]
			const result = findInstances(movieWebhook as any, movieGladiator2Data as any, filters as any)
			strictEqual(result, "complex-test")
		})

		it("Test complex condition with negative case", () => {
			const filters = [
				{
					media_type: "movie" as const,
					conditions: {
						keywords: { include: "epic", exclude: "horror" },
						genres: { require: "Action" },
						originalLanguage: "fr",
					},
					apply: "complex-test",
				},
			]
			const result = findInstances(movieWebhook as any, movieGladiator2Data as any, filters as any)
			strictEqual(result, null)
		})
	})

	it("Test movie filter with exclude keyword", () => {
		const filters = [
			{
				media_type: "movie" as const,
				conditions: { originalLanguage: "en" },
				apply: "lang-test",
			},
		]
		const result = findInstances(movieWebhook as any, movieGladiator2Data as any, filters as any)
		strictEqual(result, "lang-test")
	})

	it("Exclude movie with keyword", () => {
		const filters = [
			{
				media_type: "movie" as const,
				conditions: { keywords: { exclude: "epic" } },
				apply: "exclude-test",
			},
		]
		const result = findInstances(movieWebhook as any, movieGladiator2Data as any, filters as any)
		strictEqual(result, null)
	})

	it("Match show with language only", () => {
		const filters = [
			{
				media_type: "tv" as const,
				conditions: { originalLanguage: "en" },
				apply: "lang-test",
			},
		]
		const result = findInstances(showWebhook as any, showArcaneData as any, filters as any)
		strictEqual(result, "lang-test")
	})

	it("Test keyword exclusion", () => {
		const filters = [
			{
				media_type: "movie" as const,
				conditions: { keywords: { exclude: "epic" }, originalLanguage: "en" },
				apply: "exclude-test",
			},
		]
		const result = findInstances(movieWebhook as any, movieGladiator2Data as any, filters as any)
		strictEqual(result, null)
	})

	it("Test keyword matching", () => {
		const filters = [
			{
				media_type: "movie" as const,
				conditions: { keywords: "power" },
				apply: "keyword-test",
			},
		]
		const result = findInstances(
			movieWebhook as any,
			{
				...movieGladiator2Data,
				keywords: [{ id: 1, name: "power" }],
			} as any,
			filters as any
		)
		strictEqual(result, "keyword-test")
	})

	it("Match movie based on age rating", () => {
		const filters = [
			{
				media_type: "movie" as const,
				conditions: { contentRatings: "16" },
				apply: "rating-test",
			},
		]
		const result = findInstances(
			movieWebhook as any,
			{
				...movieGladiator2Data,
				contentRatings: { results: [{ rating: "16" }] },
			} as any,
			filters as any
		)
		strictEqual(result, "rating-test")
	})

	it("Handle non-matching cases gracefully", () => {
		const filters = [
			{
				media_type: "movie" as const,
				conditions: {
					keywords: "epic",
					genres: ["Adventure", "Drama"],
					originalLanguage: "pl",
				},
				apply: "non-match-test",
			},
		]
		const result = findInstances(movieWebhook as any, movieGladiator2Data as any, filters as any)
		strictEqual(result, null)
	})

	it("Match a complex filter with mixed types (strings, arrays)", () => {
		const filters = [
			{
				media_type: "tv" as const,
				conditions: {
					keywords: ["power", "dramatic"],
					genres: ["Sci-Fi & Fantasy", "Animation"],
				},
				apply: "complex-mixed-test",
			},
		]
		const result = findInstances(showWebhook as any, showArcaneData as any, filters as any)
		strictEqual(result, "complex-mixed-test")
	})
})
