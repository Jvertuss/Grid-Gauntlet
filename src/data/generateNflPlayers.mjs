// src/data/generateNflPlayers.mjs

import fs from "node:fs";
import path from "node:path";

/* =========================================================
   CONFIG
   ========================================================= */

const DEFAULT_SEASONS = [
    2010,
    2011,
    2012,
    2013,
    2014,
    2015,
    2016,
    2017,
    2018,
    2019,
    2020,
    2021,
    2022,
    2023,
    2024,
    2025,
];

const requestedSeasons = process.argv
    .slice(2)
    .map(Number)
    .filter(Number.isFinite);

const SEASONS =
    requestedSeasons.length > 0
        ? [...new Set(requestedSeasons)]
            .sort((a, b) => a - b)
        : DEFAULT_SEASONS;


/* =========================================================
   DATA URLS
   ========================================================= */

const getStatsUrl = (season) =>
    `https://github.com/nflverse/nflverse-data/releases/download/` +
    `stats_player/stats_player_week_${season}.csv`;

const SCHEDULE_URL =
    "https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv";

const PLAYERS_URL =
    "https://github.com/nflverse/nflverse-data/releases/download/players/players.csv";


console.log("");
console.log("🏈 Gridiron Gauntlet NFL Database Generator");
console.log(`Seasons: ${SEASONS.join(", ")}`);
console.log("Scoring: FULL PPR");
console.log("Season Type: REGULAR SEASON ONLY");
console.log("Bye Weeks: AUTOMATIC");
console.log("");


/* =========================================================
   NFL TEAM DATA
   ========================================================= */

const TEAM_DATA = {
    ARI: {
        name: "Arizona Cardinals",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ari.png",
    },

    ATL: {
        name: "Atlanta Falcons",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/atl.png",
    },

    BAL: {
        name: "Baltimore Ravens",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/bal.png",
    },

    BUF: {
        name: "Buffalo Bills",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/buf.png",
    },

    CAR: {
        name: "Carolina Panthers",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/car.png",
    },

    CHI: {
        name: "Chicago Bears",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/chi.png",
    },

    CIN: {
        name: "Cincinnati Bengals",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/cin.png",
    },

    CLE: {
        name: "Cleveland Browns",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/cle.png",
    },

    DAL: {
        name: "Dallas Cowboys",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/dal.png",
    },

    DEN: {
        name: "Denver Broncos",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/den.png",
    },

    DET: {
        name: "Detroit Lions",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/det.png",
    },

    GB: {
        name: "Green Bay Packers",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/gb.png",
    },

    HOU: {
        name: "Houston Texans",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/hou.png",
    },

    IND: {
        name: "Indianapolis Colts",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ind.png",
    },

    JAX: {
        name: "Jacksonville Jaguars",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/jax.png",
    },

    KC: {
        name: "Kansas City Chiefs",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
    },

    LAC: {
        name: "Los Angeles Chargers",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lac.png",
    },

    LAR: {
        name: "Los Angeles Rams",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lar.png",
    },

    LV: {
        name: "Las Vegas Raiders",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/lv.png",
    },

    MIA: {
        name: "Miami Dolphins",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/mia.png",
    },

    MIN: {
        name: "Minnesota Vikings",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/min.png",
    },

    NE: {
        name: "New England Patriots",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ne.png",
    },

    NO: {
        name: "New Orleans Saints",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/no.png",
    },

    NYG: {
        name: "New York Giants",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png",
    },

    NYJ: {
        name: "New York Jets",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png",
    },

    PHI: {
        name: "Philadelphia Eagles",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/phi.png",
    },

    PIT: {
        name: "Pittsburgh Steelers",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/pit.png",
    },

    SEA: {
        name: "Seattle Seahawks",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png",
    },

    SF: {
        name: "San Francisco 49ers",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/sf.png",
    },

    TB: {
        name: "Tampa Bay Buccaneers",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/tb.png",
    },

    TEN: {
        name: "Tennessee Titans",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/ten.png",
    },

    WAS: {
        name: "Washington Commanders",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png",
    },

    WSH: {
        name: "Washington Commanders",
        logo: "https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png",
    },
};


/* =========================================================
   CARD TIER RULES
   ========================================================= */

const CARD_TIER_RULES = {
    QB: {
        goldPpg: 20.0,
        platinumPpg: 23.0,
    },

    RB: {
        goldPpg: 17.0,
        platinumPpg: 20.0,
    },

    WR: {
        goldPpg: 16.5,
        platinumPpg: 20.0,
    },

    TE: {
        goldPpg: 12.5,
        platinumPpg: 16.0,
    },
};

const GOLD_MIN_GAMES = 10;
const PLATINUM_MIN_GAMES = 12;

const GOLD_TOP_PERCENT = 0.15;
const PLATINUM_TOP_PERCENT = 0.05;


/* =========================================================
   CSV PARSER
   ========================================================= */

function parseCSV(text) {
    const rows = [];

    let row = [];
    let field = "";
    let insideQuotes = false;

    for (
        let i = 0;
        i < text.length;
        i++
    ) {
        const char =
            text[i];

        const next =
            text[i + 1];

        if (
            char === '"'
        ) {
            if (
                insideQuotes &&
                next === '"'
            ) {
                field += '"';
                i++;
                continue;
            }

            insideQuotes =
                !insideQuotes;

            continue;
        }

        if (
            char === "," &&
            !insideQuotes
        ) {
            row.push(
                field
            );

            field = "";

            continue;
        }

        if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !insideQuotes
        ) {
            if (
                char === "\r" &&
                next === "\n"
            ) {
                i++;
            }

            row.push(
                field
            );

            field = "";

            if (
                row.some(
                    (value) =>
                        value !== ""
                )
            ) {
                rows.push(
                    row
                );
            }

            row = [];

            continue;
        }

        field +=
            char;
    }

    if (
        field.length > 0 ||
        row.length > 0
    ) {
        row.push(
            field
        );

        if (
            row.some(
                (value) =>
                    value !== ""
            )
        ) {
            rows.push(
                row
            );
        }
    }

    if (
        !rows.length
    ) {
        return [];
    }

    const headers =
        rows[0];

    return rows
        .slice(1)
        .map(
            (values) => {
                const object =
                    {};

                headers.forEach(
                    (
                        header,
                        index
                    ) => {
                        object[
                            header
                        ] =
                            values[
                            index
                            ] ??
                            "";
                    }
                );

                return object;
            }
        );
}


/* =========================================================
   HELPERS
   ========================================================= */

function clean(
    value
) {
    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(
        value
    ).trim();
}


function num(
    value
) {
    const parsed =
        Number(
            value
        );

    return Number.isFinite(
        parsed
    )
        ? parsed
        : 0;
}


/* =========================================================
   NORMALIZE TEAM CODES

   Historical franchises are converted to the modern
   abbreviation used everywhere else in Gridiron Gauntlet.

   STL -> LAR
   SD  -> LAC
   OAK -> LV
   JAC -> JAX
   ========================================================= */

function normalizeTeamCode(
    value
) {
    const code =
        clean(
            value
        ).toUpperCase();

    const aliases = {
        LA:
            "LAR",

        STL:
            "LAR",

        SD:
            "LAC",

        OAK:
            "LV",

        JAC:
            "JAX",

        WSH:
            "WAS",
    };

    return (
        aliases[
        code
        ] ||
        code
    );
}


/* =========================================================
   FETCH WITH RETRIES
   ========================================================= */

async function fetchWithRetry(
    url,
    attempts = 5
) {
    let lastError =
        null;

    for (
        let attempt = 1;
        attempt <= attempts;
        attempt++
    ) {
        try {
            console.log(
                `Download attempt ${attempt}/${attempts}...`
            );

            const response =
                await fetch(
                    url,
                    {
                        headers: {
                            "User-Agent":
                                "Gridiron-Gauntlet/1.0",

                            Accept:
                                "text/csv,text/plain,*/*",
                        },
                    }
                );

            if (
                !response.ok
            ) {
                throw new Error(
                    `HTTP ${response.status} ${response.statusText}`
                );
            }

            return response;
        }
        catch (
        error
        ) {
            lastError =
                error;

            const errorCode =
                error?.cause?.code ||
                error?.code ||
                error?.message ||
                "Unknown error";

            console.warn(
                `Attempt ${attempt} failed: ${errorCode}`
            );

            if (
                attempt <
                attempts
            ) {
                const waitTime =
                    attempt *
                    1500;

                console.log(
                    `Retrying in ${(
                        waitTime /
                        1000
                    ).toFixed(1)}s...`
                );

                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            waitTime
                        )
                );
            }
        }
    }

    throw new Error(
        `Download failed after ${attempts} attempts.\n` +
        `${url}\n` +
        `${lastError?.message || lastError}`
    );
}


/* =========================================================
   PLAYER HEADSHOT LOOKUP

   Headshot priority:
   1. Original weekly nflverse headshot
   2. nflverse player metadata headshot
   3. ESPN headshot fallback

   The important part is that we DO NOT replace a good
   existing headshot just because an ESPN ID exists.
   ========================================================= */

let PLAYER_META_BY_GSIS =
    {};

let PLAYER_META_BY_NAME =
    {};


/* =========================================================
   NORMALIZE PLAYER NAME FOR FALLBACK LOOKUPS
   ========================================================= */

function normalizeLookupName(
    value
) {
    return String(
        value ||
        ""
    )
        .toLowerCase()
        .replace(
            /\./g,
            ""
        )
        .replace(
            /'/g,
            ""
        )
        .replace(
            /-/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();
}


/* =========================================================
   ESPN HEADSHOT URL
   ========================================================= */

function getEspnHeadshotUrl(
    espnId
) {
    const id =
        clean(
            espnId
        );

    if (
        !id
    ) {
        return "";
    }

    return (
        `https://a.espncdn.com/i/headshots/nfl/players/full/${id}.png`
    );
}


/* =========================================================
   BAD / PLACEHOLDER HEADSHOT CHECK
   ========================================================= */

function looksLikeBadHeadshot(
    url
) {
    const value =
        clean(
            url
        ).toLowerCase();

    if (
        !value
    ) {
        return true;
    }

    return (
        value.includes(
            "default"
        ) ||

        value.includes(
            "placeholder"
        ) ||

        value.includes(
            "silhouette"
        ) ||

        value.endsWith(
            "/0.png"
        )
    );
}


/* =========================================================
   LOAD NFLVERSE PLAYER METADATA

   This gives us extra information such as:
   - GSIS ID
   - ESPN ID
   - historical headshot
   - player name

   This is mainly used to rescue older players that don't
   have a headshot in the weekly stats file.
   ========================================================= */

async function loadPlayerMetaLookup() {
    console.log(
        "Downloading nflverse player metadata..."
    );

    console.log(
        PLAYERS_URL
    );


    const response =
        await fetchWithRetry(
            PLAYERS_URL
        );


    const csvText =
        await response.text();


    const rows =
        parseCSV(
            csvText
        );


    if (
        !rows.length
    ) {
        throw new Error(
            "Players metadata file contained no rows."
        );
    }


    const byGsis =
        {};

    const byName =
        {};


    for (
        const row of
        rows
    ) {
        const gsisId =
            clean(
                row.gsis_id
            );


        const displayName =
            clean(
                row.display_name ||
                row.player_name ||
                row.full_name ||
                row.football_name ||
                row.short_name
            );


        const espnId =
            clean(
                row.espn_id
            );


        const metadataHeadshot =
            clean(
                row.headshot
            );


        const meta = {
            gsisId,

            displayName,

            espnId,

            headshot:
                metadataHeadshot,
        };


        if (
            gsisId &&
            !byGsis[
            gsisId
            ]
        ) {
            byGsis[
                gsisId
            ] =
                meta;
        }


        const nameKey =
            normalizeLookupName(
                displayName
            );


        if (
            nameKey &&
            !byName[
            nameKey
            ]
        ) {
            byName[
                nameKey
            ] =
                meta;
        }
    }


    PLAYER_META_BY_GSIS =
        byGsis;


    PLAYER_META_BY_NAME =
        byName;


    console.log(
        `Loaded ${Object.keys(
            byGsis
        ).length.toLocaleString()} player metadata rows`
    );


    console.log(
        ""
    );
}


/* =========================================================
   RESOLVE PLAYER HEADSHOT

   IMPORTANT:

   We preserve the original weekly headshot FIRST.

   This keeps modern players such as Kyle Pitts using the
   image that already looked correct before historical
   headshot support was added.

   Historical fallbacks only kick in when that image is
   missing or obviously invalid.
   ========================================================= */

function resolveHeadshotUrl({
    playerId,
    playerName,
    rowHeadshot = "",
}) {
    const metaById =
        PLAYER_META_BY_GSIS[
        playerId
        ];

    const metaByName =
        PLAYER_META_BY_NAME[
        normalizeLookupName(
            playerName
        )
        ];

    const meta =
        metaById ||
        metaByName ||
        null;


    /*
     * OLD HEADSHOT PRIORITY
     *
     * 1. ESPN headshot
     * 2. nflverse player metadata
     * 3. weekly stats headshot
     *
     * This was the version that was working
     * much better for historical players.
     */

    const candidates = [
        getEspnHeadshotUrl(
            meta?.espnId
        ),

        clean(
            meta?.headshot
        ),

        clean(
            rowHeadshot
        ),
    ].filter(
        Boolean
    );


    for (
        const candidate of
        candidates
    ) {
        if (
            !looksLikeBadHeadshot(
                candidate
            )
        ) {
            return candidate;
        }
    }


    return (
        candidates[
        0
        ] ||
        ""
    );
}


/* =========================================================
   AUTOMATIC BYE WEEKS
   ========================================================= */

async function loadByeWeeksBySeason() {
    console.log(
        "Downloading NFL schedule for bye weeks..."
    );

    console.log(
        SCHEDULE_URL
    );

    const response =
        await fetchWithRetry(
            SCHEDULE_URL
        );

    const csvText =
        await response.text();

    const rows =
        parseCSV(
            csvText
        );

    if (
        !rows.length
    ) {
        throw new Error(
            "NFL schedule file contained no rows."
        );
    }


    const requestedSeasonSet =
        new Set(
            SEASONS.map(
                Number
            )
        );


    const seasonTeams =
        {};

    const seasonMaxWeek =
        {};


    for (
        const row of
        rows
    ) {
        const season =
            Number(
                row.season
            );


        if (
            !requestedSeasonSet.has(
                season
            )
        ) {
            continue;
        }


        const gameType =
            clean(
                row.game_type
            );


        if (
            gameType !==
            "REG"
        ) {
            continue;
        }


        const week =
            Number(
                row.week
            );


        if (
            !Number.isFinite(
                week
            ) ||
            week <=
            0
        ) {
            continue;
        }


        const homeTeam =
            normalizeTeamCode(
                row.home_team
            );


        const awayTeam =
            normalizeTeamCode(
                row.away_team
            );


        if (
            !seasonTeams[
            season
            ]
        ) {
            seasonTeams[
                season
            ] =
                {};
        }


        seasonMaxWeek[
            season
        ] =
            Math.max(
                seasonMaxWeek[
                season
                ] ||
                0,

                week
            );


        for (
            const team of
            [
                homeTeam,
                awayTeam,
            ]
        ) {
            if (
                !team
            ) {
                continue;
            }


            if (
                !seasonTeams[
                season
                ][
                team
                ]
            ) {
                seasonTeams[
                    season
                ][
                    team
                ] =
                    new Set();
            }


            seasonTeams[
                season
            ][
                team
            ].add(
                week
            );
        }
    }


    const byeWeeksBySeason =
        {};


    for (
        const season of
        SEASONS
    ) {
        const teams =
            seasonTeams[
            season
            ] ||
            {};


        const maxWeek =
            seasonMaxWeek[
            season
            ] ||
            0;


        if (
            !maxWeek
        ) {
            throw new Error(
                `No regular-season schedule rows found for ${season}.`
            );
        }


        byeWeeksBySeason[
            season
        ] =
            {};


        for (
            const [
                team,
                playedWeeks,
            ] of
            Object.entries(
                teams
            )
        ) {
            const missingWeeks =
                [];


            for (
                let week = 1;
                week <= maxWeek;
                week++
            ) {
                if (
                    !playedWeeks.has(
                        week
                    )
                ) {
                    missingWeeks.push(
                        week
                    );
                }
            }


            const byeWeek =
                missingWeeks.length ===
                    1
                    ? missingWeeks[
                    0
                    ]
                    : null;


            byeWeeksBySeason[
                season
            ][
                team
            ] =
                byeWeek;
        }


        const knownByes =
            Object.values(
                byeWeeksBySeason[
                season
                ]
            )
                .filter(
                    (week) =>
                        Number.isFinite(
                            Number(
                                week
                            )
                        )
                )
                .length;


        console.log(
            `${season}: calculated ${knownByes} team bye weeks`
        );
    }


    console.log(
        ""
    );


    return byeWeeksBySeason;
}


/* =========================================================
   CARD TIER CALCULATION
   ========================================================= */

function calculateSeasonTiers(
    players
) {
    const playerList =
        Object.values(
            players
        );


    for (
        const player of
        playerList
    ) {
        player.seasonTier =
            "BASE";

        player.positionRank =
            null;

        player.positionPlayerCount =
            null;

        player.positionPercentile =
            null;
    }


    const positions = [
        "QB",
        "RB",
        "WR",
        "TE",
    ];


    for (
        const position of
        positions
    ) {
        const rules =
            CARD_TIER_RULES[
            position
            ];


        const positionPlayers =
            playerList
                .filter(
                    (player) =>
                        player.position ===
                        position &&
                        player.gamesPlayed >=
                        GOLD_MIN_GAMES
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        b.averageFantasyPoints -
                        a.averageFantasyPoints
                );


        const totalPlayers =
            positionPlayers.length;


        if (
            totalPlayers ===
            0
        ) {
            continue;
        }


        const platinumRankLimit =
            Math.max(
                1,

                Math.ceil(
                    totalPlayers *
                    PLATINUM_TOP_PERCENT
                )
            );


        const goldRankLimit =
            Math.max(
                1,

                Math.ceil(
                    totalPlayers *
                    GOLD_TOP_PERCENT
                )
            );


        positionPlayers.forEach(
            (
                player,
                index
            ) => {
                const rank =
                    index +
                    1;


                const topPercent =
                    (
                        rank /
                        totalPlayers
                    ) *
                    100;


                player.positionRank =
                    rank;


                player.positionPlayerCount =
                    totalPlayers;


                player.positionPercentile =
                    Number(
                        topPercent.toFixed(
                            1
                        )
                    );


                const qualifiesPlatinum =
                    player.gamesPlayed >=
                    PLATINUM_MIN_GAMES &&

                    player.averageFantasyPoints >=
                    rules.platinumPpg &&

                    rank <=
                    platinumRankLimit;


                if (
                    qualifiesPlatinum
                ) {
                    player.seasonTier =
                        "PLATINUM";

                    return;
                }


                const qualifiesGold =
                    player.gamesPlayed >=
                    GOLD_MIN_GAMES &&

                    player.averageFantasyPoints >=
                    rules.goldPpg &&

                    rank <=
                    goldRankLimit;


                if (
                    qualifiesGold
                ) {
                    player.seasonTier =
                        "GOLD";

                    return;
                }


                player.seasonTier =
                    "BASE";
            }
        );
    }


    return playerList.reduce(
        (
            counts,
            player
        ) => {
            if (
                counts[
                player.seasonTier
                ] !==
                undefined
            ) {
                counts[
                    player.seasonTier
                ]++;
            }


            return counts;
        },

        {
            PLATINUM: 0,
            GOLD: 0,
            BASE: 0,
        }
    );
}


/* =========================================================
   BYE WEEK DATABASE
   ========================================================= */

let BYE_WEEKS_BY_SEASON =
    {};


/* =========================================================
   BUILD ONE SEASON
   ========================================================= */

async function buildSeason(
    season
) {
    const url =
        getStatsUrl(
            season
        );


    console.log(
        "========================================"
    );


    console.log(
        `Downloading ${season}...`
    );


    console.log(
        url
    );


    const response =
        await fetchWithRetry(
            url
        );


    const csvText =
        await response.text();


    console.log(
        `Downloaded ${(csvText.length / 1024 / 1024).toFixed(2)} MB`
    );


    const rows =
        parseCSV(
            csvText
        );


    console.log(
        `Parsed ${rows.length.toLocaleString()} rows`
    );


    if (
        !rows.length
    ) {
        throw new Error(
            `No rows were found in the ${season} NFL dataset.`
        );
    }


    const players =
        {};


    /* =====================================================
       PROCESS WEEKLY ROWS
       ===================================================== */

    for (
        const row of
        rows
    ) {
        const playerId =
            clean(
                row.player_id
            );


        const playerName =
            clean(
                row.player_display_name ||
                row.player_name
            );


        const position =
            clean(
                row.position
            );


        const seasonType =
            clean(
                row.season_type
            );


        const week =
            num(
                row.week
            );


        const team =
            normalizeTeamCode(
                row.team
            );


        const opponent =
            normalizeTeamCode(
                row.opponent_team
            );


        const headshot =
            resolveHeadshotUrl({
                playerId,
                playerName,
                rowHeadshot:
                    row.headshot_url,
            });


        if (
            seasonType !==
            "REG"
        ) {
            continue;
        }


        if (
            ![
                "QB",
                "RB",
                "WR",
                "TE",
            ].includes(
                position
            )
        ) {
            continue;
        }


        if (
            !playerId ||
            !playerName ||
            !week
        ) {
            continue;
        }


        const teamInfo =
            TEAM_DATA[
            team
            ] || {
                name:
                    team ||
                    "Unknown Team",

                logo:
                    "",
            };


        const byeWeek =
            BYE_WEEKS_BY_SEASON?.[
            season
            ]?.[
            team
            ] ??
            null;


        /* =================================================
           CREATE PLAYER
           ================================================= */

        if (
            !players[
            playerId
            ]
        ) {
            players[
                playerId
            ] = {
                playerId,

                name:
                    playerName,

                position,

                season,

                team,

                teamName:
                    teamInfo.name,

                teams:
                    team
                        ? [
                            team,
                        ]
                        : [],

                headshot,

                teamLogo:
                    teamInfo.logo,

                byeWeek,

                averageFantasyPoints:
                    0,

                gamesPlayed:
                    0,

                totalFantasyPoints:
                    0,

                seasonTier:
                    "BASE",

                positionRank:
                    null,

                positionPlayerCount:
                    null,

                positionPercentile:
                    null,

                weekly:
                    {},

                injuries:
                    [],
            };
        }


        const player =
            players[
            playerId
            ];


        if (
            !player.headshot &&
            headshot
        ) {
            player.headshot =
                headshot;
        }


        if (
            team &&
            !player.teams.includes(
                team
            )
        ) {
            player.teams.push(
                team
            );
        }


        if (
            team
        ) {
            player.team =
                team;

            player.teamName =
                teamInfo.name;

            player.teamLogo =
                teamInfo.logo;


            player.byeWeek =
                BYE_WEEKS_BY_SEASON?.[
                season
                ]?.[
                team
                ] ??
                null;
        }


        const fantasyPoints =
            num(
                row.fantasy_points
            );


        const fantasyPointsPPR =
            num(
                row.fantasy_points_ppr
            );


        /* =================================================
           WEEKLY DATA
           ================================================= */

        player.weekly[
            week
        ] = {
            team,

            opponent,

            fantasyPoints,

            fantasyPointsPPR,


            passingYards:
                num(
                    row.passing_yards
                ),

            passingTDs:
                num(
                    row.passing_tds
                ),

            interceptions:
                num(
                    row.passing_interceptions
                ),


            carries:
                num(
                    row.carries
                ),

            rushingYards:
                num(
                    row.rushing_yards
                ),

            rushingTDs:
                num(
                    row.rushing_tds
                ),


            receptions:
                num(
                    row.receptions
                ),

            receivingYards:
                num(
                    row.receiving_yards
                ),

            receivingTDs:
                num(
                    row.receiving_tds
                ),

            targets:
                num(
                    row.targets
                ),


            fumblesLost:
                num(
                    row.sack_fumbles_lost
                ) +
                num(
                    row.rushing_fumbles_lost
                ) +
                num(
                    row.receiving_fumbles_lost
                ),
        };
    }


    /* =====================================================
       CALCULATE FULL-PPR SEASON AVERAGES
       ===================================================== */

    for (
        const player of
        Object.values(
            players
        )
    ) {
        const fantasyScores =
            Object.values(
                player.weekly
            )
                .map(
                    (week) =>
                        Number(
                            week.fantasyPointsPPR
                        )
                )
                .filter(
                    Number.isFinite
                );


        if (
            !fantasyScores.length
        ) {
            continue;
        }


        const total =
            fantasyScores.reduce(
                (
                    sum,
                    score
                ) =>
                    sum +
                    score,
                0
            );


        player.totalFantasyPoints =
            Number(
                total.toFixed(
                    2
                )
            );


        player.gamesPlayed =
            fantasyScores.length;


        player.averageFantasyPoints =
            Number(
                (
                    total /
                    fantasyScores.length
                ).toFixed(
                    2
                )
            );
    }


    /* =====================================================
       CALCULATE RARITY
       ===================================================== */

    const tierCounts =
        calculateSeasonTiers(
            players
        );


    const playerList =
        Object.values(
            players
        );


    const positionCounts = {
        QB: 0,
        RB: 0,
        WR: 0,
        TE: 0,
    };


    for (
        const player of
        playerList
    ) {
        if (
            positionCounts[
            player.position
            ] !==
            undefined
        ) {
            positionCounts[
                player.position
            ]++;
        }
    }


    /* =====================================================
       BYE WEEK CHECK
       ===================================================== */

    let playersWithBye =
        0;

    let playersWithoutBye =
        0;


    for (
        const player of
        playerList
    ) {
        if (
            player.byeWeek !==
            null &&
            Number.isFinite(
                Number(
                    player.byeWeek
                )
            )
        ) {
            playersWithBye++;
        }
        else {
            playersWithoutBye++;
        }
    }


    console.log(
        `Season ${season} complete.`
    );


    console.log(
        `Players: ${playerList.length}`
    );


    console.log(
        `QB ${positionCounts.QB} | ` +
        `RB ${positionCounts.RB} | ` +
        `WR ${positionCounts.WR} | ` +
        `TE ${positionCounts.TE}`
    );


    console.log(
        `Platinum ${tierCounts.PLATINUM} | ` +
        `Gold ${tierCounts.GOLD} | ` +
        `Base ${tierCounts.BASE}`
    );


    console.log(
        `Bye week found: ${playersWithBye} | ` +
        `Missing bye: ${playersWithoutBye}`
    );


    console.log(
        ""
    );


    return players;
}


/* =========================================================
   BUILD EVERY SEASON
   ========================================================= */

const database =
    {};


try {
    await loadPlayerMetaLookup();

    BYE_WEEKS_BY_SEASON =
        await loadByeWeeksBySeason();

    for (
        const season of
        SEASONS
    ) {
        database[
            season
        ] =
            await buildSeason(
                season
            );
    }
}
catch (
error
) {
    console.error(
        ""
    );


    console.error(
        "❌ GENERATION FAILED"
    );


    console.error(
        error?.message ||
        error
    );


    console.error(
        ""
    );


    console.error(
        "Your existing nflPlayers.js was NOT overwritten."
    );


    process.exitCode =
        1;


    throw error;
}


/* =========================================================
   RUNTIME DATABASE COMPACTION

   The generator keeps rich intermediate metadata while it ranks
   players and assigns card tiers. The live game does not read all
   of that metadata, so writing every field into nflPlayers.js made
   the browser parse and retain tens of megabytes of unused data.

   This export step removes only fields the current game never reads.
   It also omits numeric zeroes from weekly stat lines because the
   scoring/UI helpers already treat missing numeric values as zero.

   Gameplay data is preserved:
   - player identity / season / position / team
   - multi-team history
   - headshot / logo / bye week
   - season average / rarity
   - opponent
   - Full-PPR weekly score
   - stat-line values shown after each battle
   ========================================================= */

function createRuntimeDatabase(
    sourceDatabase
) {
    const runtimeDatabase =
        {};


    for (
        const [
            season,
            seasonPlayers,
        ] of
        Object.entries(
            sourceDatabase
        )
    ) {
        const runtimeSeason =
            {};


        for (
            const [
                playerId,
                player,
            ] of
            Object.entries(
                seasonPlayers
            )
        ) {
            const runtimePlayer = {
                playerId:
                    player.playerId,

                name:
                    player.name,

                position:
                    player.position,

                season:
                    player.season,

                team:
                    player.team,

                headshot:
                    player.headshot,

                teamLogo:
                    player.teamLogo,

                seasonTier:
                    player.seasonTier,

                weekly:
                    {},
            };


            if (
                Array.isArray(
                    player.teams
                ) &&
                (
                    player.teams.length >
                    1 ||
                    player.teams[
                    0
                    ] !==
                    player.team
                )
            ) {
                runtimePlayer.teams =
                    player.teams;
            }


            if (
                player.byeWeek !==
                null &&
                player.byeWeek !==
                undefined
            ) {
                runtimePlayer.byeWeek =
                    player.byeWeek;
            }


            if (
                Number(
                    player.averageFantasyPoints
                ) !==
                0
            ) {
                runtimePlayer.averageFantasyPoints =
                    player.averageFantasyPoints;
            }


            if (
                !runtimePlayer.headshot
            ) {
                delete runtimePlayer.headshot;
            }


            if (
                !runtimePlayer.teamLogo
            ) {
                delete runtimePlayer.teamLogo;
            }


            for (
                const [
                    week,
                    weekData,
                ] of
                Object.entries(
                    player.weekly ||
                    {}
                )
            ) {
                const runtimeWeek = {
                    opponent:
                        weekData.opponent,
                };


                const numericFields = [
                    "fantasyPointsPPR",
                    "passingYards",
                    "passingTDs",
                    "carries",
                    "rushingYards",
                    "rushingTDs",
                    "receptions",
                    "receivingYards",
                    "receivingTDs",
                ];


                for (
                    const field of
                    numericFields
                ) {
                    const value =
                        Number(
                            weekData[
                            field
                            ] ??
                            0
                        );


                    if (
                        value !==
                        0
                    ) {
                        runtimeWeek[
                        field
                        ] =
                            value;
                    }
                }


                runtimePlayer.weekly[
                week
                ] =
                    runtimeWeek;
            }


            runtimeSeason[
            playerId
            ] =
                runtimePlayer;
        }


        runtimeDatabase[
        season
        ] =
            runtimeSeason;
    }


    return runtimeDatabase;
}


const runtimeDatabase =
    createRuntimeDatabase(
        database
    );


/* =========================================================
   CREATE OUTPUT
   ========================================================= */

const output = `
// ========================================================
// GRIDIRON GAUNTLET NFL PLAYER DATABASE
// AUTO-GENERATED
// Seasons: ${SEASONS.join(", ")}
// Scoring: Full PPR
// Season Type: Regular Season Only
// Card Rarities: Base / Gold / Platinum
// Bye Weeks: Automatic from historical schedule
// ========================================================

export const NFL_PLAYERS = ${JSON.stringify(
    runtimeDatabase
)};


// --------------------------------------------------------
// Available seasons
// --------------------------------------------------------

export function getAvailableSeasons() {
    return Object.keys(NFL_PLAYERS)
        .map(Number)
        .sort((a, b) => a - b);
}


// --------------------------------------------------------
// Get one player
// --------------------------------------------------------

export function getPlayerFromDatabase(
    season,
    playerId
) {
    return (
        NFL_PLAYERS?.[season]?.[playerId] ||
        null
    );
}


// --------------------------------------------------------
// Get all players for one season
// --------------------------------------------------------

export function getPlayersForSeason(
    season
) {
    return Object.values(
        NFL_PLAYERS?.[season] || {}
    );
}


// --------------------------------------------------------
// Find player by name in one season
// --------------------------------------------------------

export function findPlayerByName(
    season,
    playerName
) {
    const target =
        String(
            playerName ||
            ""
        )
            .trim()
            .toLowerCase();


    return (
        getPlayersForSeason(
            season
        ).find(
            (player) =>
                String(
                    player.name ||
                    ""
                )
                    .trim()
                    .toLowerCase() ===
                target
        ) ||
        null
    );
}


// --------------------------------------------------------
// Get every season version of one player
// --------------------------------------------------------

export function getPlayerSeasons(
    playerId
) {
    return getAvailableSeasons()
        .map(
            (season) =>
                getPlayerFromDatabase(
                    season,
                    playerId
                )
        )
        .filter(
            Boolean
        );
}


// --------------------------------------------------------
// Find every season version by name
// --------------------------------------------------------

export function findPlayerAcrossSeasons(
    playerName
) {
    return getAvailableSeasons()
        .map(
            (season) =>
                findPlayerByName(
                    season,
                    playerName
                )
        )
        .filter(
            Boolean
        );
}


// --------------------------------------------------------
// Get teammates from exact historical season
// --------------------------------------------------------

export function getTeammatesForPlayer(
    season,
    playerId
) {
    const player =
        getPlayerFromDatabase(
            season,
            playerId
        );


    if (
        !player
    ) {
        return [];
    }


    const playerTeams =
        new Set(
            player.teams?.length
                ? player.teams
                : [
                    player.team,
                ].filter(
                    Boolean
                )
        );


    return getPlayersForSeason(
        season
    )
        .filter(
            (candidate) => {
                if (
                    candidate.playerId ===
                    player.playerId
                ) {
                    return false;
                }


                const candidateTeams =
                    candidate.teams?.length
                        ? candidate.teams
                        : [
                            candidate.team,
                        ];


                return candidateTeams.some(
                    (team) =>
                        playerTeams.has(
                            team
                        )
                );
            }
        );
}


// --------------------------------------------------------
// Empty player template
// --------------------------------------------------------

export function createEmptyPlayer({
    name = "",
    position = "",
    season = ${Math.max(...SEASONS)},
    team = "",
    teamName = "",
    playerId = "",
    headshot = "",
    teamLogo = "",
    byeWeek = null
} = {}) {
    return {
        playerId,

        name,

        position,

        season,

        team,

        teamName,

        teams:
            team
                ? [
                    team,
                ]
                : [],

        headshot,

        teamLogo,

        byeWeek,


        averageFantasyPoints:
            0,

        gamesPlayed:
            0,

        totalFantasyPoints:
            0,


        seasonTier:
            "BASE",


        positionRank:
            null,

        positionPlayerCount:
            null,

        positionPercentile:
            null,


        weekly:
            {},

        injuries:
            [],
    };
}
`;


/* =========================================================
   OUTPUT DIRECTORY
   ========================================================= */

const outputDirectory =
    path.resolve(
        "src",
        "data"
    );


fs.mkdirSync(
    outputDirectory,
    {
        recursive:
            true,
    }
);


/* =========================================================
   OUTPUT FILE
   ========================================================= */

const outputPath =
    path.join(
        outputDirectory,
        "nflPlayers.js"
    );


/* =========================================================
   WRITE
   ========================================================= */

fs.writeFileSync(
    outputPath,
    output,
    "utf8"
);


/* =========================================================
   FINAL SUMMARY
   ========================================================= */

console.log(
    "========================================"
);

console.log(
    "NFL PLAYER DATABASE GENERATED"
);

console.log(
    "========================================"
);

console.log(
    `Seasons: ${SEASONS.join(", ")}`
);

console.log(
    "Scoring: Full PPR"
);

console.log(
    "Games: Regular Season Only"
);

console.log(
    "Rarity: Base / Gold / Platinum"
);

console.log(
    "Bye Weeks: Automatic"
);

console.log(
    ""
);


for (
    const season of
    SEASONS
) {
    console.log(
        `${season}: ${Object.keys(
            database[
            season
            ]
        ).length} players`
    );
}


console.log(
    ""
);

console.log(
    `Output: ${outputPath}`
);

console.log(
    "========================================"
);

console.log(
    ""
);