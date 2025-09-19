// ChampionDataService.js - Minimal clean version without any scope issues! :]
class ChampionDataService {
    constructor() {
        this.cache = {
            allChampions: null,
            detailedChampions: {},
            lastFetch: null
        };
        this.DDragonVersion = '15.18.1';
        this.language = 'en_US';
    }

    formatChampionKey(key) {
        const specialCases = {
            'Wukong': 'MonkeyKing',
            'Nunu & Willump': 'Nunu',
        };
        return specialCases[key] || key.replace(/['\s]/g, '');
    }

    async fetchAllChampions() {
        if (this.cache.allChampions &&
            this.cache.lastFetch &&
            (Date.now() - this.cache.lastFetch) < 3600000) {
            return this.cache.allChampions;
        }

        try {
            const url = `https://ddragon.leagueoflegends.com/cdn/${this.DDragonVersion}/data/${this.language}/champion.json`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch champions: ${response.status}`);
            }

            const data = await response.json();
            this.cache.allChampions = data.data;
            this.cache.lastFetch = Date.now();

            return data.data;
        } catch (error) {
            console.error('Error fetching all champions:', error);
            throw error;
        }
    }

    async fetchChampionDetails(championKey) {
        const formattedKey = this.formatChampionKey(championKey);

        if (this.cache.detailedChampions[formattedKey]) {
            return this.cache.detailedChampions[formattedKey];
        }

        // Define URL outside try block so it's accessible everywhere
        const url = `https://ddragon.leagueoflegends.com/cdn/${this.DDragonVersion}/data/${this.language}/champion/${formattedKey}.json`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                console.warn(`Direct fetch failed for ${formattedKey}`);
                // Try with proxy - now url is accessible here!
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                const proxyResponse = await fetch(proxyUrl);

                if (!proxyResponse.ok) {
                    throw new Error(`Failed to fetch champion details: ${proxyResponse.status}`);
                }

                const proxyData = await proxyResponse.json();
                const championData = proxyData.data[formattedKey];
                this.cache.detailedChampions[formattedKey] = championData;
                return championData;
            }

            const data = await response.json();
            const championData = data.data[formattedKey];
            this.cache.detailedChampions[formattedKey] = championData;

            return championData;
        } catch (error) {
            console.error(`Error fetching details for ${championKey}:`, error);
            const allChampions = await this.fetchAllChampions();
            return allChampions[formattedKey] || allChampions[championKey];
        }
    }

    async getChampion(championKey) {
        try {
            return await this.fetchChampionDetails(championKey);
        } catch (error) {
            const allChampions = await this.fetchAllChampions();
            const formattedKey = this.formatChampionKey(championKey);
            return allChampions[formattedKey] || allChampions[championKey];
        }
    }

    getChampionImageUrls(championKey) {
        const formattedKey = this.formatChampionKey(championKey);
        return {
            square: `https://ddragon.leagueoflegends.com/cdn/${this.DDragonVersion}/img/champion/${formattedKey}.png`,
            loading: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${formattedKey}_0.jpg`,
            splash: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${formattedKey}_0.jpg`,
        };
    }

    clearCache() {
        this.cache = {
            allChampions: null,
            detailedChampions: {},
            lastFetch: null
        };
    }
}

const championDataService = new ChampionDataService();
export default championDataService;