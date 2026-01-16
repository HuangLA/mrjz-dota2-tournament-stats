require('dotenv').config();

module.exports = {
    // Stratz API Configuration
    STRATZ_API_URL: 'https://api.stratz.com/graphql',
    STRATZ_API_TOKEN: process.env.STRATZ_API_TOKEN || '',

    // GraphQL查询模板
    MATCH_DETAILS_QUERY: (matchId) => `
        query {
            match(id: ${matchId}) {
                id
                didRadiantWin
                players {
                    steamAccountId
                    isVictory
                    kills
                    deaths
                    assists
                    stats {
                        rampages
                        godLike
                        firstBloodTime
                        killStreaks
                    }
                }
                playbackData {
                    roshanEvents {
                        time
                        isRadiant
                        didRadiantPickup
                    }
                    pickBans {
                        isPick
                        heroId
                        order
                    }
                }
            }
        }
    `,

    // 请求配置
    REQUEST_TIMEOUT: 30000,
    MAX_RETRIES: 3
};
