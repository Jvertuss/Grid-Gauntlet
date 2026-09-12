import React, {
    useState,
} from "react";

import PlayerCard from "./components/PlayerCard.jsx";
import HallOfFame from "./components/HallofFame.jsx";
import PerkCard from "./components/PerkCard.jsx";
import LegalPage from "./components/LegalPage.jsx";

import {
    LEGAL_EFFECTIVE_DATE,
    PRIVACY_POLICY_SECTIONS,
    TERMS_SECTIONS,
    DISCLAIMER_SECTIONS,
    THIRD_PARTY_SECTIONS,
} from "./data/legalContent.js";

import {
    NFL_PLAYERS,
} from "./data/nflPlayers.js";

import TEAM_LOGOS from "./data/teamLogos.js";

import TEAM_COLORS, {
    DEFAULT_TEAM_COLORS,
} from "./data/teamColors.js";

import {
    generatePerkChoices,
    getBoosterPackChoiceCount,
    rollBoosterRarity,
} from "./data/perks.js";

import "./styles/app.css";
import "./styles/layout.css";
import "./styles/mobile.css";
import screenshotDraft from "./assets/screenshots/screen-01.svg";
import screenshotBattles from "./assets/screenshots/screen-02.svg";
import screenshotPerks from "./assets/screenshots/screen-03.svg";


/* =========================================================
   CONSTANTS
   ========================================================= */

const MAX_ROUNDS =
    12;

const ENDLESS_START_ROUND =
    MAX_ROUNDS + 1;

const FALLBACK_SEASON =
    2024;


let wildcardRosterRulesEnabled =
    false;


const NFL_DIVISIONS = {
    AFC_EAST: [
        "BUF",
        "MIA",
        "NE",
        "NYJ",
    ],

    AFC_NORTH: [
        "BAL",
        "CIN",
        "CLE",
        "PIT",
    ],

    AFC_SOUTH: [
        "HOU",
        "IND",
        "JAX",
        "TEN",
    ],

    AFC_WEST: [
        "DEN",
        "KC",
        "LV",
        "LAC",
    ],

    NFC_EAST: [
        "DAL",
        "NYG",
        "PHI",
        "WAS",
    ],

    NFC_NORTH: [
        "CHI",
        "DET",
        "GB",
        "MIN",
    ],

    NFC_SOUTH: [
        "ATL",
        "CAR",
        "NO",
        "TB",
    ],

    NFC_WEST: [
        "ARI",
        "LAR",
        "SF",
        "SEA",
    ],
};

/* =========================================================
   STATIC NFL LOOKUPS

   These tables never change at runtime. Keeping them outside
   helper functions avoids rebuilding alias objects and scanning
   every division each time Division Rival needs a lookup.
   ========================================================= */

const NFL_FRANCHISE_ALIASES = Object.freeze({
    STL:
        "LAR",

    LA:
        "LAR",

    SD:
        "LAC",

    OAK:
        "LV",

    WSH:
        "WAS",

    WFT:
        "WAS",

    JAC:
        "JAX",
});


const NFL_DIVISION_BY_TEAM =
    new Map(
        Object.entries(
            NFL_DIVISIONS
        ).flatMap(
            (
                [
                    divisionName,
                    teams,
                ]
            ) =>
                teams.map(
                    (
                        team
                    ) => [
                        team,
                        divisionName,
                    ]
                )
        )
    );


/* =========================================================
   CREATOR LINKS

   Paste the final profile URLs here when ready.
   The About page only shows a link button when the URL exists.
   ========================================================= */

const CREATOR_NAME =
    "Jvertus";


const GITHUB_URL =
    "";

const SLOT_POSITIONS = [
    "QB",
    "RB",
    "RB",
    "WR",
    "WR",
    "TE",
    "FLEX",
];

const DRAFT_POSITIONS = [
    "QB",
    "RB",
    "WR",
    "TE",
];

const REQUIRED_POSITIONS = [
    "QB",
    "RB",
    "WR",
    "TE",
];

const NFL_WEEKS =
    Array.from(
        {
            length:
                18,
        },
        (
            _,
            index
        ) =>
            index + 1
    );


/* =========================================================
   BLIND WEEK PROGRESSION

   Rounds 1-3:
   No blind weeks.

   Rounds 4-6:
   One blind week.

   Rounds 7-12:
   Two blind weeks.
   ========================================================= */

function getBlindWeekCount(
    roundNumber
) {
    const round =
        Number(
            roundNumber
        ) ||
        1;

    if (
        round <=
        3
    ) {
        return 0;
    }

    if (
        round <=
        6
    ) {
        return 1;
    }

    return 2;
}


/* =========================================================
   CPU DIFFICULTY

   poolFraction:
   How much of the strongest player pool
   the CPU may draft from.

   Larger values = a wider / easier draft pool.

   lineupTopFraction:
   How much of the strongest complete-lineup set
   the CPU may randomly choose from.

   Larger values = more lineup variance / easier CPU.

   Round 12 uses the exact mathematical
   best lineup available to that CPU roster.
   ========================================================= */

const CPU_DIFFICULTY = {
    1: {
        poolFraction:
            0.80,

        lineupTopFraction:
            0.68,

        rarityWeight:
            0.00,
    },

    2: {
        poolFraction:
            0.74,

        lineupTopFraction:
            0.60,

        rarityWeight:
            0.05,
    },

    3: {
        poolFraction:
            0.66,

        lineupTopFraction:
            0.52,

        rarityWeight:
            0.10,
    },

    4: {
        poolFraction:
            0.58,

        lineupTopFraction:
            0.44,

        rarityWeight:
            0.20,
    },

    5: {
        poolFraction:
            0.50,

        lineupTopFraction:
            0.36,

        rarityWeight:
            0.35,
    },

    6: {
        poolFraction:
            0.42,

        lineupTopFraction:
            0.29,

        rarityWeight:
            0.50,
    },

    7: {
        poolFraction:
            0.34,

        lineupTopFraction:
            0.22,

        rarityWeight:
            0.70,
    },

    8: {
        poolFraction:
            0.27,

        lineupTopFraction:
            0.16,

        rarityWeight:
            0.90,
    },

    9: {
        poolFraction:
            0.20,

        lineupTopFraction:
            0.10,

        rarityWeight:
            1.10,
    },

    10: {
        poolFraction:
            0.13,

        lineupTopFraction:
            0.06,

        rarityWeight:
            1.30,
    },

    11: {
        poolFraction:
            0.08,

        lineupTopFraction:
            0.025,

        rarityWeight:
            1.55,
    },

    12: {
        poolFraction:
            0.04,

        lineupTopFraction:
            0,

        rarityWeight:
            1.80,
    },
};


/* =========================================================
   SHUFFLE
   ========================================================= */

function shuffle(
    items
) {
    const copy =
        [...items];

    for (
        let index =
            copy.length -
            1;

        index >
        0;

        index--
    ) {
        const randomIndex =
            Math.floor(
                Math.random() *
                (
                    index +
                    1
                )
            );

        [
            copy[index],
            copy[randomIndex],
        ] = [
                copy[randomIndex],
                copy[index],
            ];
    }

    return copy;
}


/* =========================================================
   PLAYER HELPERS
   ========================================================= */

function getRawPlayerId(
    player
) {
    if (
        !player
    ) {
        return "";
    }

    return String(
        player.playerId ||
        player.player_id ||
        player.id ||
        ""
    );
}


function getPlayerSeason(
    player
) {
    return Number(
        player?.season ||
        player?.year ||
        FALLBACK_SEASON
    );
}


function getPlayerPosition(
    player
) {
    return String(
        player?.position ||
        player?.pos ||
        ""
    )
        .trim()
        .toUpperCase();
}


function getPlayerName(
    player
) {
    return (
        player?.name ||
        player?.playerName ||
        "Unknown Player"
    );
}


function getPlayerTeam(
    player
) {
    return String(
        player?.team ||
        "FA"
    ).toUpperCase();
}


/* =========================================================
   DIVISION RIVAL HELPERS
   ========================================================= */

function normalizeNFLFranchise(
    team
) {
    const code =
        String(
            team ||
            ""
        )
            .trim()
            .toUpperCase();

    return (
        NFL_FRANCHISE_ALIASES[
        code
        ] ||
        code
    );
}


function getNFLDivision(
    team
) {
    const franchise =
        normalizeNFLFranchise(
            team
        );

    const divisionName =
        NFL_DIVISION_BY_TEAM.get(
            franchise
        );

    if (
        !divisionName
    ) {
        return null;
    }

    return {
        name:
            divisionName,

        teams:
            NFL_DIVISIONS[
            divisionName
            ],
    };
}


function getDivisionRivals(
    team
) {
    const franchise =
        normalizeNFLFranchise(
            team
        );

    const division =
        getNFLDivision(
            franchise
        );

    if (
        !division
    ) {
        return [];
    }

    return division.teams.filter(
        (
            rival
        ) =>
            rival !==
            franchise
    );
}


function wait(
    milliseconds
) {
    return new Promise(
        (
            resolve
        ) =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


function getPlayerHeadshot(
    player
) {
    return (
        player?.headshot ||
        player?.headshotUrl ||
        player?.headshot_url ||
        ""
    );
}


function getPlayerInitials(
    player
) {
    return getPlayerName(
        player
    )
        .split(
            " "
        )
        .filter(
            Boolean
        )
        .map(
            (part) =>
                part[0]
        )
        .join(
            ""
        )
        .slice(
            0,
            2
        )
        .toUpperCase();
}


function getPlayerAccent(
    player
) {
    const team =
        getPlayerTeam(
            player
        );

    const colors =
        TEAM_COLORS?.[
        team
        ] ||
        DEFAULT_TEAM_COLORS;

    return (
        colors.accent ||
        colors.primary ||
        "#ff6500"
    );
}


/* =========================================================
   UNIQUE PLAYER-SEASON ID
   ========================================================= */

const PLAYER_SEASON_ID_CACHE =
    new WeakMap();


function getPlayerId(
    player
) {
    if (
        !player
    ) {
        return "";
    }

    if (
        typeof player ===
            "object" &&
        PLAYER_SEASON_ID_CACHE.has(
            player
        )
    ) {
        return PLAYER_SEASON_ID_CACHE.get(
            player
        );
    }

    const rawId =
        getRawPlayerId(
            player
        ) ||
        String(
            player.name ||
            ""
        )
            .trim()
            .toLowerCase();

    const season =
        getPlayerSeason(
            player
        );

    const id =
        `${rawId}::${season}`;

    if (
        typeof player ===
        "object"
    ) {
        PLAYER_SEASON_ID_CACHE.set(
            player,
            id
        );
    }

    return id;
}


/* =========================================================
   BATTLE AVATAR
   ========================================================= */

function BattlePlayerAvatar({
    player,
}) {
    if (
        !player
    ) {
        return null;
    }

    const headshot =
        getPlayerHeadshot(
            player
        );

    const initials =
        getPlayerInitials(
            player
        );

    const team =
        getPlayerTeam(
            player
        );

    const colors =
        TEAM_COLORS?.[
        team
        ] ||
        DEFAULT_TEAM_COLORS;

    const accent =
        colors.accent ||
        colors.primary ||
        "#ff6500";

    return (
        <div
            className="battle-player-avatar"
            style={{
                "--battle-accent":
                    accent,

                borderColor:
                    accent,
            }}
        >
            {headshot ? (
                <img
                    referrerPolicy="no-referrer"
                    src={
                        headshot
                    }
                    alt={
                        getPlayerName(
                            player
                        )
                    }
                    onError={(
                        event
                    ) => {
                        event.currentTarget.style.display =
                            "none";

                        const fallback =
                            event.currentTarget
                                .nextElementSibling;

                        if (
                            fallback
                        ) {
                            fallback.style.display =
                                "flex";
                        }
                    }}
                />
            ) : null}

            <div
                className="battle-player-avatar-fallback"
                style={{
                    display:
                        headshot
                            ? "none"
                            : "flex",

                    background:
                        `linear-gradient(145deg, ${accent}, ${colors.primary || "#222"})`,
                }}
            >
                {initials}
            </div>
        </div>
    );
}


const MemoizedBattlePlayerAvatar =
    React.memo(
        BattlePlayerAvatar
    );


/* =========================================================
   LAZY PLAYER DATABASE INDEXES

   These caches are built only when a feature needs them and
   reuse the exact same player object references afterward.

   No game rules, random odds, scores, or UI behavior change.
   ========================================================= */

const PLAYERS_BY_SEASON_CACHE =
    new Map();


let ALL_PLAYERS_CACHE =
    null;


let PLAYERS_BY_POSITION_CACHE =
    null;


let PLAYER_HISTORY_BY_RAW_ID_CACHE =
    null;


let PLAYER_HISTORY_BY_NAME_CACHE =
    null;


const PLAYERS_BY_SEASON_FRANCHISE_CACHE =
    new Map();


/* =========================================================
   GET PLAYERS FOR SEASON
   ========================================================= */

function getPlayersForSeason(
    season
) {
    const seasonKey =
        String(
            season
        );

    if (
        PLAYERS_BY_SEASON_CACHE.has(
            seasonKey
        )
    ) {
        return PLAYERS_BY_SEASON_CACHE.get(
            seasonKey
        );
    }

    const database =
        NFL_PLAYERS?.[
        seasonKey
        ] ||
        NFL_PLAYERS?.[
        season
        ] ||
        {};

    const players =
        Object.values(
            database
        )
            .filter(
                (
                    player
                ) =>
                    player &&
                    DRAFT_POSITIONS.includes(
                        getPlayerPosition(
                            player
                        )
                    )
            );

    PLAYERS_BY_SEASON_CACHE.set(
        seasonKey,
        players
    );

    return players;
}


/* =========================================================
   ALL LOADED SEASONS
   ========================================================= */

function getAllPlayers() {
    if (
        ALL_PLAYERS_CACHE
    ) {
        return ALL_PLAYERS_CACHE;
    }

    ALL_PLAYERS_CACHE =
        Object.keys(
            NFL_PLAYERS ||
            {}
        )
            .flatMap(
                (
                    season
                ) =>
                    getPlayersForSeason(
                        season
                    )
            )
            .filter(
                Boolean
            );

    return ALL_PLAYERS_CACHE;
}


/* =========================================================
   ALL PLAYERS BY POSITION
   ========================================================= */

function getAllPlayersByPosition(
    position
) {
    if (
        !PLAYERS_BY_POSITION_CACHE
    ) {
        PLAYERS_BY_POSITION_CACHE =
            new Map(
                DRAFT_POSITIONS.map(
                    (
                        draftPosition
                    ) => [
                        draftPosition,
                        [],
                    ]
                )
            );

        for (
            const player of
            getAllPlayers()
        ) {
            const playerPosition =
                getPlayerPosition(
                    player
                );

            const pool =
                PLAYERS_BY_POSITION_CACHE.get(
                    playerPosition
                );

            if (
                pool
            ) {
                pool.push(
                    player
                );
            }
        }
    }

    return (
        PLAYERS_BY_POSITION_CACHE.get(
            String(
                position ||
                ""
            )
                .trim()
                .toUpperCase()
        ) ||
        []
    );
}


/* =========================================================
   PLAYER HISTORY INDEX

   Built only when Time Travel is used.
   ========================================================= */

function ensurePlayerHistoryIndexes() {
    if (
        PLAYER_HISTORY_BY_RAW_ID_CACHE &&
        PLAYER_HISTORY_BY_NAME_CACHE
    ) {
        return;
    }

    PLAYER_HISTORY_BY_RAW_ID_CACHE =
        new Map();

    PLAYER_HISTORY_BY_NAME_CACHE =
        new Map();

    for (
        const player of
        getAllPlayers()
    ) {
        const rawId =
            getRawPlayerId(
                player
            );

        const normalizedName =
            String(
                player.name ||
                ""
            )
                .trim()
                .toLowerCase();

        if (
            rawId
        ) {
            const byId =
                PLAYER_HISTORY_BY_RAW_ID_CACHE.get(
                    rawId
                ) ||
                [];

            byId.push(
                player
            );

            PLAYER_HISTORY_BY_RAW_ID_CACHE.set(
                rawId,
                byId
            );
        }

        if (
            normalizedName
        ) {
            const byName =
                PLAYER_HISTORY_BY_NAME_CACHE.get(
                    normalizedName
                ) ||
                [];

            byName.push(
                player
            );

            PLAYER_HISTORY_BY_NAME_CACHE.set(
                normalizedName,
                byName
            );
        }
    }
}


function getHistoricalPlayerCandidates(
    player
) {
    if (
        !player
    ) {
        return [];
    }

    ensurePlayerHistoryIndexes();

    const rawId =
        getRawPlayerId(
            player
        );

    const normalizedName =
        String(
            player.name ||
            ""
        )
            .trim()
            .toLowerCase();

    const byId =
        rawId
            ? (
                PLAYER_HISTORY_BY_RAW_ID_CACHE.get(
                    rawId
                ) ||
                []
            )
            : [];

    const byName =
        normalizedName
            ? (
                PLAYER_HISTORY_BY_NAME_CACHE.get(
                    normalizedName
                ) ||
                []
            )
            : [];

    if (
        byId.length ===
        0
    ) {
        return byName;
    }

    if (
        byName.length ===
        0
    ) {
        return byId;
    }

    const seenIds =
        new Set(
            byId.map(
                getPlayerId
            )
        );

    return [
        ...byId,
        ...byName.filter(
            (
                candidate
            ) =>
                !seenIds.has(
                    getPlayerId(
                        candidate
                    )
                )
        ),
    ];
}


/* =========================================================
   PLAYERS BY HISTORICAL FRANCHISE / SEASON
   ========================================================= */

function getPlayersForSeasonFranchise(
    season,
    franchise
) {
    const normalizedFranchise =
        normalizeNFLFranchise(
            franchise
        );

    const cacheKey =
        `${String(
            season
        )}::${normalizedFranchise}`;

    if (
        PLAYERS_BY_SEASON_FRANCHISE_CACHE.has(
            cacheKey
        )
    ) {
        return PLAYERS_BY_SEASON_FRANCHISE_CACHE.get(
            cacheKey
        );
    }

    const players =
        getPlayersForSeason(
            season
        ).filter(
            (
                player
            ) =>
                normalizeNFLFranchise(
                    getPlayerTeam(
                        player
                    )
                ) ===
                normalizedFranchise
        );

    PLAYERS_BY_SEASON_FRANCHISE_CACHE.set(
        cacheKey,
        players
    );

    return players;
}


/* =========================================================
   WEEK DATA
   ========================================================= */

function getWeekData(
    player,
    week
) {
    if (
        !player
    ) {
        return null;
    }

    return (
        player.weekly?.[
        String(
            week
        )
        ] ||
        player.weekly?.[
        week
        ] ||
        null
    );
}


/* =========================================================
   TE PREMIUM

   For 3 rounds after acquisition:
   every TE earns +0.5 fantasy points per reception.

   Visible weeks may use the exact weekly reception total.
   Blind weeks must NOT inspect the hidden week, so Auto Lineup
   uses the player's season-average receptions as an estimate.
   ========================================================= */

const TE_PREMIUM_RECEPTION_BONUS =
    0.5;


function getTePremiumWeekBonus(
    player,
    week,
    tePremiumActive = false
) {
    if (
        !tePremiumActive ||
        getPlayerPosition(
            player
        ) !==
        "TE"
    ) {
        return 0;
    }


    const weekData =
        getWeekData(
            player,
            week
        );


    return (
        Number(
            weekData?.receptions ??
            0
        ) *
        TE_PREMIUM_RECEPTION_BONUS
    );
}


function getUserWeekFantasyPoints(
    player,
    week,
    tePremiumActive = false
) {
    const weekData =
        getWeekData(
            player,
            week
        );


    const baseFantasyPoints =
        Number(
            weekData?.fantasyPointsPPR ??
            0
        );


    return (
        baseFantasyPoints +
        getTePremiumWeekBonus(
            player,
            week,
            tePremiumActive
        )
    );
}


const TE_PREMIUM_AVERAGE_RECEPTIONS_CACHE =
    new WeakMap();


function getTePremiumAdjustedSeasonAverage(
    player,
    tePremiumActive = false
) {
    const baseAverage =
        getPlayerAverage(
            player
        );


    if (
        !tePremiumActive ||
        getPlayerPosition(
            player
        ) !==
        "TE"
    ) {
        return baseAverage;
    }


    let averageReceptions =
        typeof player ===
            "object"
            ? TE_PREMIUM_AVERAGE_RECEPTIONS_CACHE.get(
                player
            )
            : undefined;


    if (
        averageReceptions ===
        undefined
    ) {
        let totalReceptions =
            0;

        let playableWeekCount =
            0;


        for (
            const weekData of
            Object.values(
                player?.weekly ||
                {}
            )
        ) {
            if (
                !weekData ||
                !weekData.opponent
            ) {
                continue;
            }

            playableWeekCount++;

            totalReceptions +=
                Number(
                    weekData.receptions ??
                    0
                );
        }


        averageReceptions =
            playableWeekCount >
                0
                ? (
                    totalReceptions /
                    playableWeekCount
                )
                : 0;


        if (
            typeof player ===
            "object"
        ) {
            TE_PREMIUM_AVERAGE_RECEPTIONS_CACHE.set(
                player,
                averageReceptions
            );
        }
    }


    return (
        baseAverage +
        averageReceptions *
        TE_PREMIUM_RECEPTION_BONUS
    );
}


/* =========================================================
   WEEKLY RESULT STAT LINE
   ========================================================= */

function getWeeklyResultStatLine(
    player,
    week
) {
    const weekData =
        getWeekData(
            player,
            week
        );

    if (!weekData) {
        return "NO GAME";
    }

    const position =
        getPlayerPosition(
            player
        );

    const passingYards =
        Number(
            weekData.passingYards ||
            0
        );

    const passingTDs =
        Number(
            weekData.passingTDs ||
            0
        );

    const carries =
        Number(
            weekData.carries ||
            0
        );

    const rushingYards =
        Number(
            weekData.rushingYards ||
            0
        );

    const rushingTDs =
        Number(
            weekData.rushingTDs ||
            0
        );

    const receptions =
        Number(
            weekData.receptions ||
            0
        );

    const receivingYards =
        Number(
            weekData.receivingYards ||
            0
        );

    const receivingTDs =
        Number(
            weekData.receivingTDs ||
            0
        );


    /* =====================================================
       QB
       PASS YDS • RUSH YDS • TD / TOT TD

       Passing TD only:
       287 PASS YDS • 14 RUSH YDS • 3 TD

       Passing + rushing TD:
       245 PASS YDS • 91 RUSH YDS • 4 TOT TD
       ===================================================== */

    if (
        position === "QB"
    ) {
        const totalTDs =
            passingTDs +
            rushingTDs +
            receivingTDs;

        const touchdownTypes =
            [
                passingTDs > 0,
                rushingTDs > 0,
                receivingTDs > 0,
            ].filter(
                Boolean
            ).length;

        const stats = [
            `${passingYards} PASS YDS`,
            `${rushingYards} RUSH YDS`,
        ];

        if (
            totalTDs > 0
        ) {
            if (
                touchdownTypes > 1
            ) {
                stats.push(
                    `${totalTDs} TOT TD`
                );
            }

            else if (
                passingTDs > 0
            ) {
                stats.push(
                    `${passingTDs} TD`
                );
            }

            else if (
                rushingTDs > 0
            ) {
                stats.push(
                    `${rushingTDs} RUSH TD`
                );
            }

            else if (
                receivingTDs > 0
            ) {
                stats.push(
                    `${receivingTDs} REC TD`
                );
            }
        }

        return stats.join(
            " • "
        );
    }


    /* =====================================================
       RB / WR / TE

       YDS = rushing + receiving yards

       TD from one method:
       2 TD

       TD from multiple methods:
       2 TOT TD
       ===================================================== */

    const totalYards =
        rushingYards +
        receivingYards;

    const totalTDs =
        passingTDs +
        rushingTDs +
        receivingTDs;

    const touchdownTypes =
        [
            passingTDs > 0,
            rushingTDs > 0,
            receivingTDs > 0,
        ].filter(
            Boolean
        ).length;


    let touchdownText =
        "";

    if (
        totalTDs > 0
    ) {
        touchdownText =
            touchdownTypes > 1
                ? `${totalTDs} TOT TD`
                : `${totalTDs} TD`;
    }


    /* =====================================================
       RB
       CAR • REC • YDS • TD
       ===================================================== */

    if (
        position === "RB"
    ) {
        const stats = [
            `${carries} CAR`,
            `${receptions} REC`,
            `${totalYards} YDS`,
        ];

        if (
            touchdownText
        ) {
            stats.push(
                touchdownText
            );
        }

        return stats.join(
            " • "
        );
    }


    /* =====================================================
       WR / TE
       REC • optional CAR • YDS • TD

       CAR only appears if they actually had a carry.
       ===================================================== */

    if (
        position === "WR" ||
        position === "TE"
    ) {
        const stats = [
            `${receptions} REC`,
        ];

        if (
            carries > 0
        ) {
            stats.push(
                `${carries} CAR`
            );
        }

        stats.push(
            `${totalYards} YDS`
        );

        if (
            touchdownText
        ) {
            stats.push(
                touchdownText
            );
        }

        return stats.join(
            " • "
        );
    }


    return "";
}


function playerHasGame(
    player,
    week
) {
    const weekData =
        getWeekData(
            player,
            week
        );

    return Boolean(
        weekData &&
        weekData.opponent
    );
}




const PLAYABLE_WEEKS_CACHE =
    new WeakMap();


function getPlayableWeeks(
    player
) {
    if (
        !player
    ) {
        return [];
    }

    if (
        typeof player ===
            "object" &&
        PLAYABLE_WEEKS_CACHE.has(
            player
        )
    ) {
        return PLAYABLE_WEEKS_CACHE.get(
            player
        );
    }

    const weeks =
        NFL_WEEKS.filter(
            (
                week
            ) =>
                playerHasGame(
                    player,
                    week
                )
        );

    if (
        typeof player ===
        "object"
    ) {
        PLAYABLE_WEEKS_CACHE.set(
            player,
            weeks
        );
    }

    return weeks;
}


/* =========================================================
   ROUND ONE POOL
   ========================================================= */

function buildRoundOnePool() {
    const positionTargets = {
        QB:
            15,

        RB:
            25,

        WR:
            40,

        TE:
            20,
    };

    /*
     * Opening draft stays mostly
     * normal / average.
     */

    const averageRanges = {
        QB: [
            8,
            20,
        ],

        RB: [
            4,
            17,
        ],

        WR: [
            4,
            17,
        ],

        TE: [
            3,
            14,
        ],
    };

    const pool =
        [];

    for (
        const position of
        DRAFT_POSITIONS
    ) {
        const [
            minimum,
            maximum,
        ] =
            averageRanges[
            position
            ];

        const positionPlayers =
            getAllPlayersByPosition(
                position
            );

        let candidates =
            positionPlayers.filter(
                (
                    player
                ) => {
                    const points =
                        getPlayerAverage(
                            player
                        );

                    return (
                        Number.isFinite(
                            points
                        ) &&
                        points >=
                        minimum &&
                        points <=
                        maximum
                    );
                }
            );

        candidates =
            shuffle(
                candidates
            );

        const selected =
            candidates.slice(
                0,
                positionTargets[
                position
                ]
            );

        if (
            selected.length <
            positionTargets[
            position
            ]
        ) {
            const selectedIds =
                new Set(
                    selected.map(
                        getPlayerId
                    )
                );

            const extras =
                shuffle(
                    positionPlayers.filter(
                        (
                            player
                        ) =>
                            !selectedIds.has(
                                getPlayerId(
                                    player
                                )
                            )
                    )
                );

            while (
                selected.length <
                positionTargets[
                position
                ] &&
                extras.length >
                0
            ) {
                selected.push(
                    extras.shift()
                );
            }
        }

        pool.push(
            ...selected
        );
    }

    return shuffle(
        pool
    );
}


/* =========================================================
   DRAFT OPTIONS
   ========================================================= */

function makeDraftOptions(
    pool
) {
    const options = {
        QB:
            [],

        RB:
            [],

        WR:
            [],

        TE:
            [],
    };

    for (
        const position of
        DRAFT_POSITIONS
    ) {
        options[
            position
        ] =
            shuffle(
                pool.filter(
                    (
                        player
                    ) =>
                        getPlayerPosition(
                            player
                        ) ===
                        position
                )
            ).slice(
                0,
                3
            );
    }

    return options;
}


/* =========================================================
   BUILD STARTING ROSTER
   ========================================================= */

function buildRoster(
    selectedPlayers
) {
    const roster =
        Array(
            SLOT_POSITIONS.length
        ).fill(
            null
        );

    const remaining =
        [
            ...selectedPlayers,
        ];

    for (
        let slotIndex =
            0;

        slotIndex <
        SLOT_POSITIONS.length;

        slotIndex++
    ) {
        const requiredPosition =
            SLOT_POSITIONS[
            slotIndex
            ];

        if (
            requiredPosition ===
            "FLEX"
        ) {
            continue;
        }

        const playerIndex =
            remaining.findIndex(
                (
                    player
                ) =>
                    getPlayerPosition(
                        player
                    ) ===
                    requiredPosition
            );

        if (
            playerIndex ===
            -1
        ) {
            continue;
        }

        roster[
            slotIndex
        ] =
            remaining[
            playerIndex
            ];

        remaining.splice(
            playerIndex,
            1
        );
    }


    const flexSlot =
        SLOT_POSITIONS.indexOf(
            "FLEX"
        );

    const flexPlayerIndex =
        remaining.findIndex(
            (
                player
            ) =>
                [
                    "RB",
                    "WR",
                    "TE",
                ].includes(
                    getPlayerPosition(
                        player
                    )
                )
        );

    if (
        flexSlot !==
        -1 &&
        flexPlayerIndex !==
        -1
    ) {
        roster[
            flexSlot
        ] =
            remaining[
            flexPlayerIndex
            ];
    }

    return roster;
}


/* =========================================================
   POSITION COUNTS
   ========================================================= */

function getPositionCounts(
    roster
) {
    const counts = {
        QB:
            0,

        RB:
            0,

        WR:
            0,

        TE:
            0,
    };

    roster
        .filter(
            Boolean
        )
        .forEach(
            (
                player
            ) => {
                const position =
                    getPlayerPosition(
                        player
                    );

                if (
                    counts[
                    position
                    ] !==
                    undefined
                ) {
                    counts[
                        position
                    ]++;
                }
            }
        );

    return counts;
}


/* =========================================================
   ROSTER RULES

   EXACTLY 7
   Minimum 1 QB/RB/WR/TE
   Maximum 2 QB
   ========================================================= */

function isRosterValid(
    roster
) {
    const activePlayers =
        roster.filter(
            Boolean
        );

    if (
        activePlayers.length !==
        7
    ) {
        return false;
    }

    if (
        wildcardRosterRulesEnabled
    ) {
        return activePlayers.every(
            (
                player
            ) =>
                [
                    "QB",
                    "RB",
                    "WR",
                    "TE",
                ].includes(
                    getPlayerPosition(
                        player
                    )
                )
        );
    }

    const counts =
        getPositionCounts(
            roster
        );

    for (
        const position of
        REQUIRED_POSITIONS
    ) {
        if (
            counts[
            position
            ] <
            1
        ) {
            return false;
        }
    }

    if (
        counts.QB >
        2
    ) {
        return false;
    }

    return true;
}


/* =========================================================
   ROSTER REPLACEMENT
   ========================================================= */

function replaceRosterPlayer(
    roster,
    playerOut,
    playerIn
) {
    const next =
        [
            ...roster,
        ];

    let index =
        next.findIndex(
            (
                candidate
            ) =>
                candidate ===
                playerOut
        );

    if (
        index ===
        -1
    ) {
        index =
            next.findIndex(
                (
                    candidate
                ) =>
                    getPlayerId(
                        candidate
                    ) ===
                    getPlayerId(
                        playerOut
                    )
            );
    }

    if (
        index ===
        -1
    ) {
        return null;
    }

    next[
        index
    ] =
        playerIn;

    return next;
}


function canTradePlayers(
    roster,
    playerOut,
    playerIn
) {
    if (
        !playerOut ||
        !playerIn
    ) {
        return false;
    }

    const nextRoster =
        replaceRosterPlayer(
            roster,
            playerOut,
            playerIn
        );

    if (
        !nextRoster
    ) {
        return false;
    }

    return isRosterValid(
        nextRoster
    );
}


function getDivisionRivalPlayers(
    targetPlayer,
    rivalFranchise,
    roster
) {
    if (
        !targetPlayer ||
        !rivalFranchise
    ) {
        return [];
    }

    const season =
        getPlayerSeason(
            targetPlayer
        );

    const rosterIds =
        new Set(
            roster
                .filter(
                    Boolean
                )
                .map(
                    getPlayerId
                )
        );

    return getPlayersForSeasonFranchise(
        season,
        rivalFranchise
    )
        .filter(
            (
                candidate
            ) => {
                if (
                    rosterIds.has(
                        getPlayerId(
                            candidate
                        )
                    )
                ) {
                    return false;
                }

                return canTradePlayers(
                    roster,
                    targetPlayer,
                    candidate
                );
            }
        )
        .sort(
            (
                a,
                b
            ) =>
                Number(
                    b.averageFantasyPoints ??
                    b.fpts ??
                    0
                ) -
                Number(
                    a.averageFantasyPoints ??
                    a.fpts ??
                    0
                )
        );
}


function getLegalReplacementTargets(
    roster,
    incomingPlayer
) {
    return roster
        .filter(
            Boolean
        )
        .filter(
            (
                playerOut
            ) =>
                canTradePlayers(
                    roster,
                    playerOut,
                    incomingPlayer
                )
        );
}


function incomingPlayerIsLegal(
    roster,
    incomingPlayer
) {
    return roster
        .filter(
            Boolean
        )
        .some(
            (
                playerOut
            ) =>
                canTradePlayers(
                    roster,
                    playerOut,
                    incomingPlayer
                )
        );
}


/* =========================================================
   CPU DIFFICULTY
   ========================================================= */

function getCpuDifficulty(
    round
) {
    const numericRound =
        Math.max(
            1,
            Number(
                round
            ) ||
            1
        );

    if (
        numericRound <=
        MAX_ROUNDS
    ) {
        return (
            CPU_DIFFICULTY[
            numericRound
            ] ||
            CPU_DIFFICULTY[
            1
            ]
        );
    }

    /*
     * ENDLESS GAUNTLET
     *
     * Round 12 already uses an optimal CPU lineup.
     * After that, difficulty rises by shrinking the CPU's
     * draft pool toward only the very strongest candidates.
     */
    const endlessDepth =
        numericRound -
        MAX_ROUNDS;

    const championship =
        CPU_DIFFICULTY[
        MAX_ROUNDS
        ];

    return {
        poolFraction:
            Math.max(
                0.005,
                championship.poolFraction *
                Math.pow(
                    0.90,
                    endlessDepth
                )
            ),

        lineupTopFraction:
            0,

        rarityWeight:
            Math.min(
                4.5,
                championship.rarityWeight +
                endlessDepth *
                0.15
            ),
    };
}


/* =========================================================
   CPU PLAYER STRENGTH FOR CURRENT 7 WEEKS

   This does NOT change actual scoring.
   It only helps CPU decide who to draft.
   ========================================================= */

function getCpuPlayerRoundStrength(
    player,
    weeks,
    round
) {
    const difficulty =
        getCpuDifficulty(
            round
        );

    const scores =
        weeks
            .map(
                (
                    week
                ) => {
                    const weekData =
                        getWeekData(
                            player,
                            week
                        );

                    if (
                        !weekData ||
                        !weekData.opponent
                    ) {
                        return null;
                    }

                    return Number(
                        weekData
                            .fantasyPointsPPR ??
                        0
                    );
                }
            )
            .filter(
                (
                    value
                ) =>
                    value !==
                    null
            );

    if (
        scores.length ===
        0
    ) {
        return -Infinity;
    }

    scores.sort(
        (
            a,
            b
        ) =>
            b -
            a
    );

    const bestWeek =
        scores[
        0
        ] ||
        0;

    const topThree =
        scores.slice(
            0,
            3
        );

    const topThreeAverage =
        topThree.reduce(
            (
                sum,
                score
            ) =>
                sum +
                score,
            0
        ) /
        topThree.length;

    const seasonAverage =
        Number(
            player.averageFantasyPoints ??
            player.fpts ??
            0
        );

    const playableWeeks =
        scores.length;

    const rarity =
        String(
            player.seasonTier ||
            "BASE"
        ).toUpperCase();

    let rarityValue =
        0;

    if (
        rarity ===
        "GOLD"
    ) {
        rarityValue =
            1;
    }

    if (
        rarity ===
        "PLATINUM"
    ) {
        rarityValue =
            2.5;
    }

    const rarityBonus =
        rarityValue *
        difficulty.rarityWeight;

    return (
        bestWeek *
        0.42 +

        topThreeAverage *
        0.30 +

        seasonAverage *
        0.22 +

        playableWeeks *
        0.25 +

        rarityBonus
    );
}


/* =========================================================
   CPU POSITION PICKER
   ========================================================= */

function getCachedCpuPlayerRoundStrength(
    player,
    weeks,
    round,
    strengthCache
) {
    if (
        strengthCache &&
        strengthCache.has(
            player
        )
    ) {
        return strengthCache.get(
            player
        );
    }

    const strength =
        getCpuPlayerRoundStrength(
            player,
            weeks,
            round
        );

    if (
        strengthCache
    ) {
        strengthCache.set(
            player,
            strength
        );
    }

    return strength;
}


function pickPlayersByPosition({
    players,
    position,
    amount,
    excludedIds,
    round,
    weeks,
    strengthCache = null,
}) {
    const difficulty =
        getCpuDifficulty(
            round
        );

    let candidates =
        players
            .filter(
                (
                    player
                ) =>
                    getPlayerPosition(
                        player
                    ) ===
                    position &&
                    !excludedIds.has(
                        getPlayerId(
                            player
                        )
                    )
            )
            .map(
                (
                    player
                ) => ({
                    player,

                    strength:
                        getCachedCpuPlayerRoundStrength(
                            player,
                            weeks,
                            round,
                            strengthCache
                        ),
                })
            )
            .filter(
                (
                    entry
                ) =>
                    Number.isFinite(
                        entry.strength
                    )
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.strength -
                    a.strength
            );

    const poolSize =
        Math.max(
            amount,
            Math.ceil(
                candidates.length *
                difficulty.poolFraction
            )
        );

    candidates =
        candidates.slice(
            0,
            poolSize
        );

    return shuffle(
        candidates
    )
        .slice(
            0,
            amount
        )
        .map(
            (
                entry
            ) =>
                entry.player
        );
}


/* =========================================================
   BUILD CPU ROSTER

   CPU drafts specifically for the seven
   selected historical weeks.
   ========================================================= */

function buildOpponentRoster(
    userRoster,
    round,
    weeks
) {
    const allPlayers =
        getAllPlayers();

    const excludedIds =
        new Set(
            userRoster
                .filter(
                    Boolean
                )
                .map(
                    getPlayerId
                )
        );

    const roster =
        [];

    /*
     * The same player strength can be requested once while
     * filling a position and again while evaluating FLEX.
     * Cache it for this one opponent build.
     */
    const strengthCache =
        new Map();


    function addPlayers(
        position,
        amount
    ) {
        const selected =
            pickPlayersByPosition({
                players:
                    getAllPlayersByPosition(
                        position
                    ),

                position,

                amount,

                excludedIds,

                round,

                weeks,

                strengthCache,
            });

        for (
            const player of
            selected
        ) {
            roster.push(
                player
            );

            excludedIds.add(
                getPlayerId(
                    player
                )
            );
        }
    }


    addPlayers(
        "QB",
        1
    );

    addPlayers(
        "RB",
        2
    );

    addPlayers(
        "WR",
        2
    );

    addPlayers(
        "TE",
        1
    );


    /* =====================================================
       FLEX
       ===================================================== */

    const difficulty =
        getCpuDifficulty(
            round
        );

    let flexCandidates =
        allPlayers
            .filter(
                (
                    player
                ) =>
                    [
                        "RB",
                        "WR",
                        "TE",
                    ].includes(
                        getPlayerPosition(
                            player
                        )
                    ) &&
                    !excludedIds.has(
                        getPlayerId(
                            player
                        )
                    )
            )
            .map(
                (
                    player
                ) => ({
                    player,

                    strength:
                        getCachedCpuPlayerRoundStrength(
                            player,
                            weeks,
                            round,
                            strengthCache
                        ),
                })
            )
            .filter(
                (
                    entry
                ) =>
                    Number.isFinite(
                        entry.strength
                    )
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.strength -
                    a.strength
            );

    const poolSize =
        Math.max(
            1,
            Math.ceil(
                flexCandidates.length *
                difficulty.poolFraction
            )
        );

    flexCandidates =
        flexCandidates.slice(
            0,
            poolSize
        );

    const flex =
        shuffle(
            flexCandidates
        )[0]
            ?.player;

    if (
        flex
    ) {
        roster.push(
            flex
        );
    }

    return roster.slice(
        0,
        7
    );
}


/* =========================================================
   FIND ANY COMPLETE WEEK ASSIGNMENT
   ========================================================= */

function findWeekAssignment(
    players,
    weeks
) {
    if (
        players.length !==
        weeks.length
    ) {
        return null;
    }

    const entries =
        players
            .map(
                (
                    player,
                    index
                ) => ({
                    player,

                    originalIndex:
                        index,

                    options:
                        weeks.filter(
                            (
                                week
                            ) =>
                                playerHasGame(
                                    player,
                                    week
                                )
                        ),
                })
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.options.length -
                    b.options.length
            );

    if (
        entries.some(
            (
                entry
            ) =>
                entry.options.length ===
                0
        )
    ) {
        return null;
    }

    const usedWeeks =
        new Set();

    const assignments =
        [];

    function search(
        index
    ) {
        if (
            index >=
            entries.length
        ) {
            return true;
        }

        const entry =
            entries[
            index
            ];

        for (
            const week of
            shuffle(
                entry.options
            )
        ) {
            if (
                usedWeeks.has(
                    week
                )
            ) {
                continue;
            }

            usedWeeks.add(
                week
            );

            assignments.push({
                week,

                player:
                    entry.player,

                rosterIndex:
                    entry.originalIndex,
            });

            if (
                search(
                    index +
                    1
                )
            ) {
                return true;
            }

            assignments.pop();

            usedWeeks.delete(
                week
            );
        }

        return false;
    }

    return search(
        0
    )
        ? assignments
        : null;
}


/* =========================================================
   CREATE RANDOM USER-SAFE WEEK SET
   ========================================================= */

function findRandomRosterWeekAssignment(
    roster
) {
    const entries =
        roster
            .map(
                (
                    player,
                    rosterIndex
                ) => ({
                    player,

                    rosterIndex,

                    options:
                        shuffle(
                            getPlayableWeeks(
                                player
                            )
                        ),
                })
            )
            .filter(
                (
                    entry
                ) =>
                    Boolean(
                        entry.player
                    )
            );

    if (
        entries.length !==
        7
    ) {
        return null;
    }

    if (
        entries.some(
            (
                entry
            ) =>
                entry.options.length ===
                0
        )
    ) {
        return null;
    }

    entries.sort(
        (
            a,
            b
        ) =>
            a.options.length -
            b.options.length
    );

    const usedWeeks =
        new Set();

    const assignments =
        [];

    function search(
        index
    ) {
        if (
            index >=
            entries.length
        ) {
            return true;
        }

        const entry =
            entries[
            index
            ];

        for (
            const week of
            entry.options
        ) {
            if (
                usedWeeks.has(
                    week
                )
            ) {
                continue;
            }

            usedWeeks.add(
                week
            );

            assignments.push({
                week,

                player:
                    entry.player,

                rosterIndex:
                    entry.rosterIndex,
            });

            if (
                search(
                    index +
                    1
                )
            ) {
                return true;
            }

            assignments.pop();

            usedWeeks.delete(
                week
            );
        }

        return false;
    }

    return search(
        0
    )
        ? assignments
        : null;
}


/* =========================================================
   USER AUTO LINEUP

   Finds the highest scoring COMPLETE
   assignment possible.
   ========================================================= */

function findBestWeekAssignment(
    roster,
    weeks
) {
    const entries =
        roster
            .map(
                (
                    player,
                    rosterIndex
                ) => {
                    const options =
                        weeks
                            .map(
                                (
                                    week
                                ) => {
                                    const weekData =
                                        getWeekData(
                                            player,
                                            week
                                        );

                                    if (
                                        !weekData ||
                                        !weekData.opponent
                                    ) {
                                        return null;
                                    }

                                    return {
                                        week,

                                        points:
                                            Number(
                                                weekData
                                                    .fantasyPointsPPR ??
                                                0
                                            ),
                                    };
                                }
                            )
                            .filter(
                                Boolean
                            )
                            .sort(
                                (
                                    a,
                                    b
                                ) =>
                                    b.points -
                                    a.points ||
                                    a.week -
                                    b.week
                            );

                    return {
                        player,

                        rosterIndex,

                        options,
                    };
                }
            )
            .filter(
                (
                    entry
                ) =>
                    Boolean(
                        entry.player
                    )
            );

    if (
        entries.length !==
        7 ||
        weeks.length !==
        7
    ) {
        return null;
    }

    if (
        entries.some(
            (
                entry
            ) =>
                entry.options.length ===
                0
        )
    ) {
        return null;
    }

    entries.sort(
        (
            a,
            b
        ) =>
            a.options.length -
            b.options.length
    );

    let bestScore =
        -Infinity;

    let bestAssignments =
        null;

    const usedWeeks =
        new Set();

    const current =
        [];


    function search(
        index,
        score
    ) {
        if (
            index >=
            entries.length
        ) {
            if (
                score >
                bestScore
            ) {
                bestScore =
                    score;

                bestAssignments =
                    current.map(
                        (
                            assignment
                        ) => ({
                            ...assignment,
                        })
                    );
            }

            return;
        }

        const entry =
            entries[
            index
            ];

        for (
            const option of
            entry.options
        ) {
            if (
                usedWeeks.has(
                    option.week
                )
            ) {
                continue;
            }

            usedWeeks.add(
                option.week
            );

            current.push({
                week:
                    option.week,

                player:
                    entry.player,

                rosterIndex:
                    entry.rosterIndex,

                fantasyPoints:
                    option.points,
            });

            search(
                index +
                1,

                score +
                option.points
            );

            current.pop();

            usedWeeks.delete(
                option.week
            );
        }
    }

    search(
        0,
        0
    );

    if (
        !bestAssignments
    ) {
        return null;
    }

    return {
        assignments:
            bestAssignments,

        totalFantasyPoints:
            bestScore,
    };
}


/* =========================================================
   ENUMERATE ALL VALID CPU LINEUPS
   ========================================================= */

function getAllCpuWeekAssignments(
    roster,
    weeks
) {
    if (
        roster.length !==
        7 ||
        weeks.length !==
        7
    ) {
        return [];
    }

    const entries =
        roster
            .map(
                (
                    player,
                    rosterIndex
                ) => ({
                    player,

                    rosterIndex,

                    options:
                        weeks
                            .map(
                                (
                                    week
                                ) => {
                                    const weekData =
                                        getWeekData(
                                            player,
                                            week
                                        );

                                    if (
                                        !weekData ||
                                        !weekData.opponent
                                    ) {
                                        return null;
                                    }

                                    return {
                                        week,

                                        points:
                                            Number(
                                                weekData
                                                    .fantasyPointsPPR ??
                                                0
                                            ),
                                    };
                                }
                            )
                            .filter(
                                Boolean
                            ),
                })
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.options.length -
                    b.options.length
            );

    if (
        entries.some(
            (
                entry
            ) =>
                entry.options.length ===
                0
        )
    ) {
        return [];
    }

    const results =
        [];

    const usedWeeks =
        new Set();

    const current =
        [];


    function search(
        index,
        totalPoints
    ) {
        if (
            index >=
            entries.length
        ) {
            results.push({
                totalFantasyPoints:
                    totalPoints,

                assignments:
                    current.map(
                        (
                            assignment
                        ) => ({
                            ...assignment,
                        })
                    ),
            });

            return;
        }

        const entry =
            entries[
            index
            ];

        for (
            const option of
            entry.options
        ) {
            if (
                usedWeeks.has(
                    option.week
                )
            ) {
                continue;
            }

            usedWeeks.add(
                option.week
            );

            current.push({
                week:
                    option.week,

                player:
                    entry.player,

                rosterIndex:
                    entry.rosterIndex,

                fantasyPoints:
                    option.points,
            });

            search(
                index +
                1,

                totalPoints +
                option.points
            );

            current.pop();

            usedWeeks.delete(
                option.week
            );
        }
    }

    search(
        0,
        0
    );

    results.sort(
        (
            a,
            b
        ) =>
            b.totalFantasyPoints -
            a.totalFantasyPoints
    );

    return results;
}


/* =========================================================
   CPU LINEUP INTELLIGENCE

   Round 1 chooses from a much wider range
   of good strategies.

   Round 12 chooses exact optimal strategy.
   ========================================================= */

function findCpuWeekAssignment(
    roster,
    weeks,
    round
) {
    const lineups =
        getAllCpuWeekAssignments(
            roster,
            weeks
        );

    if (
        lineups.length ===
        0
    ) {
        return null;
    }

    const difficulty =
        getCpuDifficulty(
            round
        );

    if (
        difficulty.lineupTopFraction <=
        0
    ) {
        return lineups[
            0
        ].assignments;
    }

    const candidateCount =
        Math.max(
            1,
            Math.ceil(
                lineups.length *
                difficulty.lineupTopFraction
            )
        );

    const intelligentPool =
        lineups.slice(
            0,
            candidateCount
        );

    return shuffle(
        intelligentPool
    )[0]
        ?.assignments ||
        null;
}


/* =========================================================
   BLIND-AWARE SLOT ASSIGNMENT

   Normal week:
   Player must actually have a game.

   Blind week:
   Any remaining player may be placed there.
   Whether they really played stays hidden until resolution.
   ========================================================= */

function playerCanUseRoundSlot(
    player,
    slot
) {
    if (
        !player ||
        !slot
    ) {
        return false;
    }

    if (
        slot.isBlind
    ) {
        return true;
    }

    return playerHasGame(
        player,
        slot.week
    );
}


function findRoundSlotAssignment(
    players,
    slots
) {
    if (
        players.length !==
        slots.length
    ) {
        return null;
    }

    const entries =
        players
            .map(
                (
                    player,
                    originalIndex
                ) => ({
                    player,

                    originalIndex,

                    options:
                        slots
                            .map(
                                (
                                    slot,
                                    slotIndex
                                ) => ({
                                    slot,
                                    slotIndex,
                                })
                            )
                            .filter(
                                (
                                    option
                                ) =>
                                    playerCanUseRoundSlot(
                                        player,
                                        option.slot
                                    )
                            ),
                })
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.options.length -
                    b.options.length
            );

    if (
        entries.some(
            (
                entry
            ) =>
                entry.options.length ===
                0
        )
    ) {
        return null;
    }

    const usedSlotIndexes =
        new Set();

    const assignments =
        [];


    function search(
        index
    ) {
        if (
            index >=
            entries.length
        ) {
            return true;
        }

        const entry =
            entries[
            index
            ];

        for (
            const option of
            entry.options
        ) {
            if (
                usedSlotIndexes.has(
                    option.slotIndex
                )
            ) {
                continue;
            }

            usedSlotIndexes.add(
                option.slotIndex
            );

            assignments.push({
                week:
                    option.slot.week,

                isBlind:
                    Boolean(
                        option.slot.isBlind
                    ),

                player:
                    entry.player,

                rosterIndex:
                    entry.originalIndex,
            });

            if (
                search(
                    index +
                    1
                )
            ) {
                return true;
            }

            assignments.pop();

            usedSlotIndexes.delete(
                option.slotIndex
            );
        }

        return false;
    }


    return search(
        0
    )
        ? assignments
        : null;
}


/* =========================================================
   AUTO LINEUP WITH BLIND-WEEK INFORMATION RULES

   Visible weeks:
   Uses the real historical weekly PPR score.

   Blind weeks:
   Does NOT look at that week's real score or availability.
   It only uses the player's season average as an estimate.
   ========================================================= */

function findBestRoundSlotAssignment(
    roster,
    roundSlots,
    rosterIndexMap = null,
    slotIndexMap = null,
    filmStudyReveals = [],
    tePremiumActive = false
) {
    if (
        roster.length !==
        roundSlots.length ||
        roster.length ===
        0
    ) {
        return null;
    }


    const resolvedRosterIndexMap =
        Array.isArray(
            rosterIndexMap
        ) &&
            rosterIndexMap.length ===
            roster.length
            ? rosterIndexMap
            : roster.map(
                (
                    _player,
                    index
                ) =>
                    index
            );


    const resolvedSlotIndexMap =
        Array.isArray(
            slotIndexMap
        ) &&
            slotIndexMap.length ===
            roundSlots.length
            ? slotIndexMap
            : roundSlots.map(
                (
                    _slot,
                    index
                ) =>
                    index
            );


    /* =====================================================
       FILM STUDY PRIORITY

       Film Study reveals two REAL CPU placements and their
       fantasy scores.

       Auto Lineup uses that information to prioritize winning
       those revealed weeks.

       Priority order:
       1. Win as many revealed Film Study weeks as possible.
       2. Put the highest-scoring feasible players into those
          revealed weeks.
       3. Then maximize the rest of the visible lineup.

       Manual placements are still preserved by autoLineup().
       ===================================================== */

    const filmStudyTargetByWeek =
        new Map(
            (
                Array.isArray(
                    filmStudyReveals
                )
                    ? filmStudyReveals
                    : []
            )
                .filter(
                    (
                        reveal
                    ) =>
                        reveal &&
                        Number.isFinite(
                            Number(
                                reveal.week
                            )
                        )
                )
                .map(
                    (
                        reveal
                    ) => [
                            Number(
                                reveal.week
                            ),

                            Number(
                                reveal.fantasyPoints ??
                                0
                            ),
                        ]
                )
        );


    /* =====================================================
       SPLIT BLIND / VISIBLE SLOTS
       ===================================================== */

    const blindSlots =
        roundSlots
            .map(
                (
                    slot,
                    slotIndex
                ) => ({
                    slot,

                    slotIndex:
                        resolvedSlotIndexMap[
                        slotIndex
                        ],
                })
            )
            .filter(
                (
                    entry
                ) =>
                    Boolean(
                        entry.slot.isBlind
                    )
            );


    const visibleSlots =
        roundSlots
            .map(
                (
                    slot,
                    slotIndex
                ) => ({
                    slot,

                    slotIndex:
                        resolvedSlotIndexMap[
                        slotIndex
                        ],
                })
            )
            .filter(
                (
                    entry
                ) =>
                    !entry.slot.isBlind
            );


    const relevantFilmStudyWeeks =
        new Set(
            visibleSlots
                .map(
                    (
                        entry
                    ) =>
                        Number(
                            entry.slot.week
                        )
                )
                .filter(
                    (
                        week
                    ) =>
                        filmStudyTargetByWeek.has(
                            week
                        )
                )
        );


    /*
     * Blind priority:
     *
     * Highest season average is tried first.
     *
     * We DO NOT inspect the hidden week's real game,
     * matchup, or score.
     */
    const rankedPlayers =
        roster
            .map(
                (
                    player,
                    rosterIndex
                ) => ({
                    player,

                    rosterIndex:
                        resolvedRosterIndexMap[
                        rosterIndex
                        ],

                    average:
                        getTePremiumAdjustedSeasonAverage(
                            player,
                            tePremiumActive
                        ),
                })
            )
            .filter(
                (
                    entry
                ) =>
                    Boolean(
                        entry.player
                    )
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    b.average -
                    a.average
            );


    if (
        rankedPlayers.length !==
        roster.length
    ) {
        return null;
    }


    /* =====================================================
       SOLVE VISIBLE WEEKS FOR A GIVEN SET OF REMAINING PLAYERS

       Visible-week objective:
       - maximize actual Film Study wins first
       - maximize total visible lineup score second
       - never sacrifice the rest of the lineup just to get
         closer to an unbeatable Film Study opponent score
       ===================================================== */

    function solveVisibleSlots(
        remainingPlayers
    ) {
        if (
            remainingPlayers.length !==
            visibleSlots.length
        ) {
            return null;
        }


        if (
            visibleSlots.length ===
            0
        ) {
            return {
                assignments:
                    [],

                score:
                    0,

                filmWins:
                    0,

                filmStudyPoints:
                    0,
            };
        }


        const entries =
            remainingPlayers
                .map(
                    (
                        playerEntry
                    ) => {
                        const options =
                            visibleSlots
                                .map(
                                    (
                                        visibleEntry
                                    ) => {
                                        const weekData =
                                            getWeekData(
                                                playerEntry.player,
                                                visibleEntry.slot.week
                                            );


                                        if (
                                            !weekData ||
                                            !weekData.opponent
                                        ) {
                                            return null;
                                        }


                                        return {
                                            week:
                                                visibleEntry.slot.week,

                                            slotIndex:
                                                visibleEntry.slotIndex,

                                            points:
                                                getUserWeekFantasyPoints(
                                                    playerEntry.player,
                                                    visibleEntry.slot.week,
                                                    tePremiumActive
                                                ),
                                        };
                                    }
                                )
                                .filter(
                                    Boolean
                                )
                                .sort(
                                    (
                                        a,
                                        b
                                    ) =>
                                        b.points -
                                        a.points
                                );


                        return {
                            ...playerEntry,

                            options,
                        };
                    }
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        a.options.length -
                        b.options.length
                );


        /*
         * This Blind-player choice is impossible if even one
         * remaining player cannot use any remaining visible week.
         */
        if (
            entries.some(
                (
                    entry
                ) =>
                    entry.options.length ===
                    0
            )
        ) {
            return null;
        }


        let bestFilmWins =
            -1;

        let bestFilmStudyPoints =
            -Infinity;

        let bestScore =
            -Infinity;

        let bestAssignments =
            null;

        const usedSlotIndexes =
            new Set();

        const current =
            [];


        function searchVisible(
            index,
            score
        ) {
            if (
                index >=
                entries.length
            ) {
                let filmWins =
                    0;

                let filmStudyPoints =
                    0;


                for (
                    const assignment of
                    current
                ) {
                    const week =
                        Number(
                            assignment.week
                        );


                    if (
                        !relevantFilmStudyWeeks.has(
                            week
                        )
                    ) {
                        continue;
                    }


                    const cpuTarget =
                        Number(
                            filmStudyTargetByWeek.get(
                                week
                            ) ??
                            0
                        );


                    const userPoints =
                        Number(
                            assignment.estimatedFantasyPoints ??
                            0
                        );


                    filmStudyPoints +=
                        userPoints;


                    if (
                        userPoints >
                        cpuTarget
                    ) {
                        filmWins++;
                    }
                }


                /*
                 * FILM STUDY DECISION ORDER
                 *
                 * 1. Win as many revealed Film Study matchups as possible.
                 * 2. If the same number of revealed matchups are won,
                 *    maximize the TOTAL visible lineup score.
                 * 3. Only use Film Study points as a final tie-breaker.
                 *
                 * This means an unbeatable revealed score is NOT chased.
                 * If nobody can beat it, Auto Lineup spends its strongest
                 * players where they create the most points elsewhere.
                 */
                const isBetter =
                    filmWins >
                    bestFilmWins ||
                    (
                        filmWins ===
                        bestFilmWins &&
                        score >
                        bestScore
                    ) ||
                    (
                        filmWins ===
                        bestFilmWins &&
                        score ===
                        bestScore &&
                        filmStudyPoints >
                        bestFilmStudyPoints
                    );


                if (
                    isBetter
                ) {
                    bestFilmWins =
                        filmWins;

                    bestFilmStudyPoints =
                        filmStudyPoints;

                    bestScore =
                        score;

                    bestAssignments =
                        current.map(
                            (
                                assignment
                            ) => ({
                                ...assignment,
                            })
                        );
                }

                return;
            }


            const entry =
                entries[
                index
                ];


            for (
                const option of
                entry.options
            ) {
                if (
                    usedSlotIndexes.has(
                        option.slotIndex
                    )
                ) {
                    continue;
                }


                usedSlotIndexes.add(
                    option.slotIndex
                );


                current.push({
                    week:
                        option.week,

                    slotIndex:
                        option.slotIndex,

                    isBlind:
                        false,

                    player:
                        entry.player,

                    rosterIndex:
                        entry.rosterIndex,

                    estimatedFantasyPoints:
                        option.points,
                });


                searchVisible(
                    index +
                    1,

                    score +
                    option.points
                );


                current.pop();


                usedSlotIndexes.delete(
                    option.slotIndex
                );
            }
        }


        searchVisible(
            0,
            0
        );


        if (
            !bestAssignments
        ) {
            return null;
        }


        return {
            assignments:
                bestAssignments,

            score:
                bestScore,

            filmWins:
                bestFilmWins,

            filmStudyPoints:
                bestFilmStudyPoints,
        };
    }


    /* =====================================================
       BLIND-WEEK PRIORITY SEARCH

       Normal behavior:
       - highest AVG player is tried in Mystery first
       - if the visible lineup breaks, move down the AVG list

       Film Study behavior:
       - still try Mystery players from highest AVG downward
       - but evaluate lower Mystery choices if doing so lets
         Auto Lineup win more of the two revealed Film Study weeks
       - if Film Study results tie, the first valid Mystery choice
         remains preferred, preserving the highest-AVG priority
       ===================================================== */

    const selectedBlindPlayers =
        [];

    const usedBlindRosterIndexes =
        new Set();

    let bestBlindSolution =
        null;


    function buildCurrentBlindSolution() {
        const remainingPlayers =
            rankedPlayers.filter(
                (
                    entry
                ) =>
                    !usedBlindRosterIndexes.has(
                        entry.rosterIndex
                    )
            );


        const visibleSolution =
            solveVisibleSlots(
                remainingPlayers
            );


        if (
            !visibleSolution
        ) {
            return null;
        }


        const blindAssignments =
            selectedBlindPlayers.map(
                (
                    playerEntry,
                    index
                ) => ({
                    week:
                        blindSlots[
                            index
                        ].slot.week,

                    slotIndex:
                        blindSlots[
                            index
                        ].slotIndex,

                    isBlind:
                        true,

                    player:
                        playerEntry.player,

                    rosterIndex:
                        playerEntry.rosterIndex,

                    estimatedFantasyPoints:
                        playerEntry.average,
                })
            );


        const blindEstimateTotal =
            blindAssignments.reduce(
                (
                    total,
                    assignment
                ) =>
                    total +
                    Number(
                        assignment.estimatedFantasyPoints ??
                        0
                    ),
                0
            );


        return {
            assignments: [
                ...blindAssignments,
                ...visibleSolution.assignments,
            ],

            estimatedTotal:
                blindEstimateTotal +
                visibleSolution.score,

            filmWins:
                visibleSolution.filmWins,

            filmStudyPoints:
                visibleSolution.filmStudyPoints,
        };
    }


    function searchBlindSlots(
        blindIndex
    ) {
        if (
            blindIndex >=
            blindSlots.length
        ) {
            const solution =
                buildCurrentBlindSolution();


            if (
                !solution
            ) {
                return null;
            }


            /*
             * Without Film Study, preserve the original behavior:
             * return the first valid solution because candidates
             * are already tried highest AVG -> lowest AVG.
             */
            if (
                relevantFilmStudyWeeks.size ===
                0
            ) {
                return solution;
            }


            /*
             * With Film Study, allow a lower-ranked Mystery choice
             * only when it improves the revealed-week strategy.
             *
             * If both Film Study metrics tie, keep the first solution
             * found, which preserves the higher-AVG Mystery choice.
             */
            /*
             * A lower-ranked Mystery player is only worth using when
             * it creates MORE actual Film Study wins.
             *
             * If the number of Film Study wins is tied, keep the first
             * valid Mystery solution found. Because Mystery candidates
             * are tried highest season average -> lowest season average,
             * this preserves the Blind Week priority rule.
             *
             * Importantly, we do NOT move a stronger player out of the
             * Mystery slot merely to score closer to an unbeatable CPU
             * Film Study total.
             */
            const isBetterFilmSolution =
                !bestBlindSolution ||
                solution.filmWins >
                bestBlindSolution.filmWins;


            if (
                isBetterFilmSolution
            ) {
                bestBlindSolution =
                    solution;
            }


            return null;
        }


        for (
            const playerEntry of
            rankedPlayers
        ) {
            if (
                usedBlindRosterIndexes.has(
                    playerEntry.rosterIndex
                )
            ) {
                continue;
            }


            usedBlindRosterIndexes.add(
                playerEntry.rosterIndex
            );


            selectedBlindPlayers.push(
                playerEntry
            );


            const solution =
                searchBlindSlots(
                    blindIndex +
                    1
                );


            /*
             * No Film Study means the first valid Mystery-first
             * solution is exactly what we want.
             */
            if (
                solution &&
                relevantFilmStudyWeeks.size ===
                0
            ) {
                return solution;
            }


            selectedBlindPlayers.pop();


            usedBlindRosterIndexes.delete(
                playerEntry.rosterIndex
            );
        }


        return null;
    }


    /*
     * No Blind Weeks:
     * simply solve all visible weeks with Film Study priority.
     */
    if (
        blindSlots.length ===
        0
    ) {
        const visibleSolution =
            solveVisibleSlots(
                rankedPlayers
            );


        if (
            !visibleSolution
        ) {
            return null;
        }


        return {
            assignments:
                visibleSolution.assignments,

            estimatedTotal:
                visibleSolution.score,

            filmWins:
                visibleSolution.filmWins,

            filmStudyPoints:
                visibleSolution.filmStudyPoints,
        };
    }


    const firstValidBlindSolution =
        searchBlindSlots(
            0
        );


    if (
        relevantFilmStudyWeeks.size ===
        0
    ) {
        return firstValidBlindSolution;
    }


    return bestBlindSolution;
}

/* =========================================================
   SAFE MANUAL PLACEMENT
   ========================================================= */

function canFinishLineupAfterPlacement({
    roster,
    roundSlots,
    rosterIndex,
    targetSlotIndex,
}) {
    const usedRosterIndexes =
        new Set();

    roundSlots.forEach(
        (
            slot,
            index
        ) => {
            if (
                index ===
                targetSlotIndex
            ) {
                return;
            }

            if (
                slot.assignedIndex !==
                null &&
                slot.assignedIndex !==
                undefined
            ) {
                usedRosterIndexes.add(
                    slot.assignedIndex
                );
            }
        }
    );

    usedRosterIndexes.add(
        rosterIndex
    );

    const remainingPlayers =
        roster.filter(
            (
                player,
                index
            ) =>
                player &&
                !usedRosterIndexes.has(
                    index
                )
        );

    const remainingSlots =
        roundSlots
            .filter(
                (
                    slot,
                    index
                ) =>
                    index !==
                    targetSlotIndex &&
                    !slot.assigned
            );

    if (
        remainingPlayers.length ===
        0 &&
        remainingSlots.length ===
        0
    ) {
        return true;
    }

    if (
        remainingPlayers.length !==
        remainingSlots.length
    ) {
        return false;
    }

    return Boolean(
        findRoundSlotAssignment(
            remainingPlayers,
            remainingSlots
        )
    );
}


/* =========================================================
   CREATE SAFE ROUND

   1. Generate 7 weeks your roster can fill.
   2. CPU drafts specifically for those weeks.
   3. CPU calculates a complete lineup.
   4. Later rounds become much smarter.
   ========================================================= */

function createSafeRoundSetup(
    userRoster,
    roundNumber
) {
    for (
        let weekAttempt =
            0;

        weekAttempt <
        120;

        weekAttempt++
    ) {
        const userAssignment =
            findRandomRosterWeekAssignment(
                userRoster
            );

        if (
            !userAssignment
        ) {
            return null;
        }

        const weeks =
            shuffle(
                userAssignment.map(
                    (
                        assignment
                    ) =>
                        assignment.week
                )
            );


        for (
            let cpuAttempt =
                0;

            cpuAttempt <
            60;

            cpuAttempt++
        ) {
            const cpuRoster =
                buildOpponentRoster(
                    userRoster,
                    roundNumber,
                    weeks
                );

            if (
                cpuRoster.length !==
                7
            ) {
                continue;
            }

            const cpuAssignments =
                findCpuWeekAssignment(
                    cpuRoster,
                    weeks,
                    roundNumber
                );

            if (
                !cpuAssignments
            ) {
                continue;
            }

            return {
                cpuRoster,

                weeks,

                cpuAssignments,
            };
        }
    }

    return null;
}


/* =========================================================
   WEEK SCRAMBLER

   Generate a different safe 7-week board while preserving
   the same opponent roster.
   ========================================================= */

function createScrambledWeekSetup(
    userRoster,
    cpuRoster,
    roundNumber,
    currentWeeks = []
) {
    const currentKey =
        [...currentWeeks]
            .map(Number)
            .sort((a, b) => a - b)
            .join("-");

    for (
        let attempt = 0;
        attempt < 180;
        attempt++
    ) {
        const userAssignment =
            findRandomRosterWeekAssignment(
                userRoster
            );

        if (
            !userAssignment
        ) {
            return null;
        }

        const weeks =
            shuffle(
                userAssignment.map(
                    (assignment) =>
                        assignment.week
                )
            );

        const newKey =
            [...weeks]
                .map(Number)
                .sort((a, b) => a - b)
                .join("-");

        if (
            currentKey &&
            newKey === currentKey
        ) {
            continue;
        }

        const cpuAssignments =
            findCpuWeekAssignment(
                cpuRoster,
                weeks,
                roundNumber
            );

        if (
            !cpuAssignments
        ) {
            continue;
        }

        return {
            weeks,
            cpuAssignments,
        };
    }

    return null;
}


/* =========================================================
   PLAYER TEAM HISTORY
   ========================================================= */

const PLAYER_TEAMS_CACHE =
    new WeakMap();


function getPlayerTeams(
    player
) {
    if (
        !player
    ) {
        return [];
    }

    if (
        typeof player ===
            "object" &&
        PLAYER_TEAMS_CACHE.has(
            player
        )
    ) {
        return PLAYER_TEAMS_CACHE.get(
            player
        );
    }

    const teams =
        Array.isArray(
            player?.teams
        ) &&
            player.teams.length >
            0
            ? player.teams.map(
                (
                    team
                ) =>
                    String(
                        team
                    ).toUpperCase()
            )
            : [
                String(
                    player?.team ||
                    ""
                ).toUpperCase(),
            ].filter(
                Boolean
            );

    if (
        typeof player ===
        "object"
    ) {
        PLAYER_TEAMS_CACHE.set(
            player,
            teams
        );
    }

    return teams;
}


/* =========================================================
   PLAYER RARITY / VALUE
   ========================================================= */

function getPlayerTier(
    player
) {
    return String(
        player?.seasonTier ||
        player?.tier ||
        player?.rarity ||
        "BASE"
    ).toUpperCase();
}


function getPlayerAverage(
    player
) {
    return Number(
        player?.averageFantasyPoints ??
        player?.fpts ??
        0
    ) || 0;
}


const PLAYER_TRADE_VALUE_CACHE =
    new WeakMap();


function getPlayerTradeValue(
    player
) {
    if (
        player &&
        typeof player ===
            "object" &&
        PLAYER_TRADE_VALUE_CACHE.has(
            player
        )
    ) {
        return PLAYER_TRADE_VALUE_CACHE.get(
            player
        );
    }

    const average =
        getPlayerAverage(
            player
        );

    const tier =
        getPlayerTier(
            player
        );

    const rarityBonus =
        tier ===
            "PLATINUM"
            ? 7
            : tier ===
                "GOLD"
                ? 3
                : 0;

    const value =
        average +
        rarityBonus;

    if (
        player &&
        typeof player ===
        "object"
    ) {
        PLAYER_TRADE_VALUE_CACHE.set(
            player,
            value
        );
    }

    return value;
}


/* =========================================================
   TEAMMATE CHOICES
   ========================================================= */

function getTeammateChoices(
    player,
    roster,
    canUseEmptyBench = false
) {
    if (
        !player
    ) {
        return [];
    }

    const season =
        getPlayerSeason(
            player
        );

    const playerTeams =
        getPlayerTeams(
            player
        );

    const rosterIds =
        new Set(
            roster
                .filter(
                    Boolean
                )
                .map(
                    getPlayerId
                )
        );

    return getPlayersForSeason(
        season
    )
        .filter(
            (
                candidate
            ) => {
                if (
                    getPlayerId(
                        candidate
                    ) ===
                    getPlayerId(
                        player
                    )
                ) {
                    return false;
                }

                if (
                    rosterIds.has(
                        getPlayerId(
                            candidate
                        )
                    )
                ) {
                    return false;
                }

                const candidateTeams =
                    getPlayerTeams(
                        candidate
                    );

                const sharedTeam =
                    candidateTeams.some(
                        (
                            team
                        ) =>
                            playerTeams.includes(
                                team
                            )
                    );

                if (
                    !sharedTeam
                ) {
                    return false;
                }

                if (
                    canUseEmptyBench
                ) {
                    return true;
                }

                return canTradePlayers(
                    roster,
                    player,
                    candidate
                );
            }
        )
        .sort(
            (
                a,
                b
            ) =>
                getPlayerAverage(
                    b
                ) -
                getPlayerAverage(
                    a
                )
        );
}


/* =========================================================
   TIME TRAVEL CHOICES
   ========================================================= */

function getHistoricalChoices(
    player,
    roster
) {
    if (
        !player
    ) {
        return [];
    }

    const currentSeason =
        getPlayerSeason(
            player
        );

    const rosterIds =
        new Set(
            roster
                .filter(
                    Boolean
                )
                .map(
                    getPlayerId
                )
        );

    return getHistoricalPlayerCandidates(
        player
    )
        .filter(
            (
                candidate
            ) => {
                if (
                    getPlayerSeason(
                        candidate
                    ) ===
                    currentSeason
                ) {
                    return false;
                }

                if (
                    rosterIds.has(
                        getPlayerId(
                            candidate
                        )
                    )
                ) {
                    return false;
                }

                return canTradePlayers(
                    roster,
                    player,
                    candidate
                );
            }
        )
        .sort(
            (
                a,
                b
            ) =>
                getPlayerSeason(
                    b
                ) -
                getPlayerSeason(
                    a
                )
        );
}


/* =========================================================
   BOOSTER PACK

   Rarity odds come from perks.js and scale by round.
   ========================================================= */

function getBoosterPackChoices(
    roster,
    roundNumber,
    canUseEmptyBench = false
) {
    /*
     * perks.js was originally tuned through Round 9.
     * Rounds 10-12 keep the strongest existing Booster Pack table
     * instead of asking the perk config for an undefined round.
     */
    const boosterRound =
        Math.min(
            9,
            Math.max(
                1,
                Number(
                    roundNumber
                ) ||
                1
            )
        );

    const amount =
        getBoosterPackChoiceCount(
            boosterRound
        );

    const rosterIds =
        new Set(
            roster
                .filter(
                    Boolean
                )
                .map(
                    getPlayerId
                )
        );

    /*
     * Build the legal candidate list once.
     *
     * The old version repeatedly filtered and re-sorted the full
     * database for every card in the pack. We preserve the exact
     * rarity rules and top-pool percentages, but bucket/sort once.
     */
    const allCandidates =
        [];

    const candidatesByTier = {
        BASE:
            [],

        GOLD:
            [],

        PLATINUM:
            [],
    };


    for (
        const player of
        getAllPlayers()
    ) {
        if (
            rosterIds.has(
                getPlayerId(
                    player
                )
            )
        ) {
            continue;
        }

        if (
            !canUseEmptyBench &&
            !incomingPlayerIsLegal(
                roster,
                player
            )
        ) {
            continue;
        }

        allCandidates.push(
            player
        );

        const tier =
            getPlayerTier(
                player
            );

        if (
            candidatesByTier[
            tier
            ]
        ) {
            candidatesByTier[
                tier
            ].push(
                player
            );
        }
    }


    for (
        const tier of
        Object.keys(
            candidatesByTier
        )
    ) {
        candidatesByTier[
            tier
        ].sort(
            (
                a,
                b
            ) =>
                getPlayerAverage(
                    b
                ) -
                getPlayerAverage(
                    a
                )
        );
    }


    const selected =
        [];

    const selectedIds =
        new Set();


    for (
        let index =
            0;

        index <
        amount;

        index++
    ) {
        const desiredTier =
            rollBoosterRarity(
                boosterRound
            );

        let tierPool =
            (
                candidatesByTier[
                desiredTier
                ] ||
                []
            ).filter(
                (
                    player
                ) =>
                    !selectedIds.has(
                        getPlayerId(
                            player
                        )
                    )
            );


        if (
            tierPool.length >
            0
        ) {
            const usefulPoolSize =
                Math.max(
                    1,
                    Math.ceil(
                        tierPool.length *
                        (
                            desiredTier ===
                                "PLATINUM"
                                ? 0.75
                                : desiredTier ===
                                    "GOLD"
                                    ? 0.65
                                    : 0.55
                        )
                    )
                );

            tierPool =
                tierPool.slice(
                    0,
                    usefulPoolSize
                );
        }


        if (
            tierPool.length ===
            0
        ) {
            tierPool =
                allCandidates.filter(
                    (
                        player
                    ) =>
                        !selectedIds.has(
                            getPlayerId(
                                player
                            )
                        )
                );
        }


        if (
            tierPool.length ===
            0
        ) {
            break;
        }


        const picked =
            shuffle(
                tierPool
            )[0];


        selected.push(
            picked
        );


        selectedIds.add(
            getPlayerId(
                picked
            )
        );
    }


    return selected;
}


/* =========================================================
   TRADING
   ========================================================= */

function getTradingChoices(
    roster,
    opponentRoster
) {
    return opponentRoster
        .filter(
            Boolean
        )
        .filter(
            (
                player
            ) =>
                incomingPlayerIsLegal(
                    roster,
                    player
                )
        );
}

/* =========================================================
   FAST TRADE MARKET HELPERS
   ========================================================= */

/*
 * Cache the converted NFL player database after the first
 * Trade Market use.
 *
 * Before:
 * getAllPlayers() could be rebuilt over and over while
 * generating offers.
 *
 * Now:
 * We build it once and reuse it.
 */
let tradeMarketPlayerCache = null;


function getTradeMarketPlayerCache() {
    if (tradeMarketPlayerCache) {
        return tradeMarketPlayerCache;
    }

    tradeMarketPlayerCache = getAllPlayers()
        .map((player) => ({
            player,

            id:
                getPlayerId(
                    player
                ),

            tier:
                getPlayerTier(
                    player
                ),

            value:
                getPlayerTradeValue(
                    player
                ),
        }))
        .filter(
            (entry) =>
                entry.id
        );

    return tradeMarketPlayerCache;
}


/* =========================================================
   CREATE FAST RARITY POOLS
   ========================================================= */

function createTradePools(
    entries
) {
    const pools = {
        ANY: [],
        BASE: [],
        GOLD: [],
        PLATINUM: [],
    };

    for (
        const entry of
        entries
    ) {
        pools.ANY.push(
            entry
        );

        if (
            pools[
            entry.tier
            ]
        ) {
            pools[
                entry.tier
            ].push(
                entry
            );
        }
    }

    return pools;
}


/* =========================================================
   FAST RANDOM PLAYER PICK
   ========================================================= */

function pickRandomUniqueEntry(
    pool,
    usedIds
) {
    if (
        !pool ||
        pool.length === 0
    ) {
        return null;
    }

    /*
     * Try random selections first.
     *
     * With thousands of players, duplicate collisions are
     * extremely rare, so this is much faster than shuffling
     * the entire player database.
     */
    for (
        let attempt = 0;
        attempt < 8;
        attempt++
    ) {
        const candidate =
            pool[
            Math.floor(
                Math.random() *
                pool.length
            )
            ];

        if (
            candidate &&
            !usedIds.has(
                candidate.id
            )
        ) {
            return candidate;
        }
    }

    /*
     * Safe fallback for very small rarity pools.
     */
    for (
        const candidate of
        pool
    ) {
        if (
            !usedIds.has(
                candidate.id
            )
        ) {
            return candidate;
        }
    }

    return null;
}


/* =========================================================
   PICK PLAYERS FOR REQUIRED TIERS
   ========================================================= */

function pickEntriesForTiers(
    pools,
    tiers
) {
    const chosen =
        [];

    const usedIds =
        new Set();

    for (
        const tier of
        tiers
    ) {
        const pool =
            tier === "ANY"
                ? pools.ANY
                : (
                    pools[
                    tier
                    ] ||
                    []
                );

        const entry =
            pickRandomUniqueEntry(
                pool,
                usedIds
            );

        if (
            !entry
        ) {
            return null;
        }

        chosen.push(
            entry
        );

        usedIds.add(
            entry.id
        );
    }

    return chosen;
}


/* =========================================================
   APPLY 2-FOR-2 TRADE
   ========================================================= */

const PLAYER_PERMUTATION_ORDERS = Object.freeze({
    0:
        [
            [],
        ],

    1:
        [
            [
                0,
            ],
        ],

    2:
        [
            [
                0,
                1,
            ],

            [
                1,
                0,
            ],
        ],

    3:
        [
            [
                0,
                1,
                2,
            ],

            [
                0,
                2,
                1,
            ],

            [
                1,
                0,
                2,
            ],

            [
                1,
                2,
                0,
            ],

            [
                2,
                0,
                1,
            ],

            [
                2,
                1,
                0,
            ],
        ],
});


function getPlayerPermutations(
    players
) {
    const cachedOrders =
        PLAYER_PERMUTATION_ORDERS[
        players.length
        ];


    if (
        cachedOrders
    ) {
        return cachedOrders.map(
            (
                order
            ) =>
                order.map(
                    (
                        index
                    ) =>
                        players[
                        index
                        ]
                )
        );
    }


    /*
     * Trade Market currently uses at most 3-for-3 offers.
     * Keep a generic fallback so this helper stays correct if
     * a future perk ever asks it to permute a larger set.
     */
    const results =
        [];


    for (
        let index = 0;
        index < players.length;
        index++
    ) {
        const current =
            players[
            index
            ];

        const remaining = [
            ...players.slice(
                0,
                index
            ),

            ...players.slice(
                index + 1
            ),
        ];

        const smallerPermutations =
            getPlayerPermutations(
                remaining
            );


        for (
            const permutation of
            smallerPermutations
        ) {
            results.push([
                current,
                ...permutation,
            ]);
        }
    }


    return results;
}


/* =========================================================
   APPLY MULTI-PLAYER TRADE

   Supports normal 2-for-2 deals and rare 3-for-3 jackpot
   deals while keeping the active roster at exactly 7.
   ========================================================= */

function applyMultiPlayerTrade(
    roster,
    playersOut,
    playersIn
) {
    if (
        !Array.isArray(
            playersOut
        ) ||
        !Array.isArray(
            playersIn
        ) ||
        playersOut.length === 0 ||
        playersOut.length !==
        playersIn.length
    ) {
        return null;
    }

    const outgoingIndexes =
        [];

    const usedIndexes =
        new Set();


    for (
        const playerOut of
        playersOut
    ) {
        const playerId =
            getPlayerId(
                playerOut
            );

        const rosterIndex =
            roster.findIndex(
                (
                    candidate,
                    index
                ) =>
                    !usedIndexes.has(
                        index
                    ) &&
                    getPlayerId(
                        candidate
                    ) ===
                    playerId
            );

        if (
            rosterIndex === -1
        ) {
            return null;
        }

        outgoingIndexes.push(
            rosterIndex
        );

        usedIndexes.add(
            rosterIndex
        );
    }


    const incomingPermutations =
        getPlayerPermutations(
            playersIn
        );


    for (
        const incomingOrder of
        incomingPermutations
    ) {
        const nextRoster = [
            ...roster,
        ];

        for (
            let index = 0;
            index <
            outgoingIndexes.length;
            index++
        ) {
            nextRoster[
                outgoingIndexes[
                index
                ]
            ] =
                incomingOrder[
                index
                ];
        }

        if (
            isRosterValid(
                nextRoster
            )
        ) {
            return nextRoster;
        }
    }

    return null;
}


/* =========================================================
   BUILD ONE FAST TRADE MARKET OFFER
   ========================================================= */

function buildTradeMarketOfferFast({
    roster,

    benchPlayer,

    rosterPools,

    incomingPools,

    giveTiers,

    receiveTiers,

    includeBench = false,

    targetRatio = 1,

    attempts = 48,
}) {
    /*
     * Choose the players you're giving away ONCE.
     *
     * The old system repeatedly filtered/shuffled huge arrays.
     */
    const activeGiveEntries =
        pickEntriesForTiers(
            rosterPools,
            giveTiers
        );

    if (
        !activeGiveEntries
    ) {
        return null;
    }

    if (
        includeBench &&
        !benchPlayer
    ) {
        return null;
    }

    const activeGive =
        activeGiveEntries.map(
            (entry) =>
                entry.player
        );

    const outgoingPlayers = [
        ...activeGive,

        ...(
            includeBench
                ? [
                    benchPlayer,
                ]
                : []
        ),
    ];

    /*
     * Values are already calculated in our cache.
     */
    const outgoingValue =
        activeGiveEntries.reduce(
            (
                total,
                entry
            ) =>
                total +
                entry.value,
            0
        ) +
        (
            includeBench
                ? getPlayerTradeValue(
                    benchPlayer
                )
                : 0
        );

    let bestOffer =
        null;

    let bestDistance =
        Infinity;


    /*
     * Instead of 350 expensive full-database shuffles,
     * use a small number of O(1) random selections.
     */
    for (
        let attempt = 0;
        attempt < attempts;
        attempt++
    ) {
        const incomingEntries =
            pickEntriesForTiers(
                incomingPools,
                receiveTiers
            );

        if (
            !incomingEntries
        ) {
            break;
        }

        const incoming =
            incomingEntries.map(
                (entry) =>
                    entry.player
            );

        const nextRoster =
            applyMultiPlayerTrade(
                roster,
                activeGive,
                incoming
            );

        if (
            !nextRoster
        ) {
            continue;
        }

        const incomingValue =
            incomingEntries.reduce(
                (
                    total,
                    entry
                ) =>
                    total +
                    entry.value,
                0
            );

        const ratio =
            outgoingValue >
                0
                ? incomingValue /
                outgoingValue
                : 1;

        const distance =
            Math.abs(
                ratio -
                targetRatio
            );

        if (
            distance <
            bestDistance
        ) {
            bestDistance =
                distance;

            bestOffer = {
                give:
                    outgoingPlayers,

                activeGive,

                receive:
                    incoming,

                nextRoster,

                consumesBench:
                    includeBench,

                ratio,
            };


            /*
             * If we're already extremely close to the desired
             * offer quality, stop searching immediately.
             */
            if (
                bestDistance <=
                0.015
            ) {
                break;
            }
        }
    }

    return bestOffer;
}


/* =========================================================
   RARE JACKPOT TRADE

   Every time Trade Market is opened there is a 20% chance
   of a fourth offer. The dream structure is:

   GIVE:    Base + Base + Base
   RECEIVE: Platinum + Gold + Base

   The offer still has to produce a legal seven-player roster.
   ========================================================= */

function buildJackpotTradeOffer({
    roster,
    benchPlayer,
    rosterPools,
    incomingPools,
}) {
    const jackpotTemplates =
        [];


    /* Best-case jackpot: 3 Bronze/Base for Plat + Gold + Base. */
    if (
        rosterPools.BASE.length >=
        3
    ) {
        jackpotTemplates.push({
            giveTiers: [
                "BASE",
                "BASE",
                "BASE",
            ],

            receiveTiers: [
                "PLATINUM",
                "GOLD",
                "BASE",
            ],
        });
    }


    /* Fallback if the roster has only two Base players. */
    if (
        rosterPools.BASE.length >=
        2
    ) {
        jackpotTemplates.push({
            giveTiers: [
                "BASE",
                "BASE",
            ],

            receiveTiers: [
                "PLATINUM",
                "GOLD",
            ],
        });
    }


    /* Strong fallback for mixed Base/Gold rosters. */
    if (
        rosterPools.BASE.length >=
        1 &&
        rosterPools.GOLD.length >=
        1
    ) {
        jackpotTemplates.push({
            giveTiers: [
                "GOLD",
                "BASE",
            ],

            receiveTiers: [
                "PLATINUM",
                "PLATINUM",
            ],
        });
    }


    /* Late-run fallback when the roster is already stacked. */
    if (
        rosterPools.GOLD.length >=
        2
    ) {
        jackpotTemplates.push({
            giveTiers: [
                "GOLD",
                "GOLD",
            ],

            receiveTiers: [
                "PLATINUM",
                "PLATINUM",
            ],
        });
    }


    if (
        jackpotTemplates.length ===
        0
    ) {
        return null;
    }


    let bestJackpot =
        null;

    let bestRatio =
        0;


    for (
        const template of
        jackpotTemplates
    ) {
        /*
         * Retry a handful of times so the outgoing players and
         * incoming players can vary without scanning/shuffling
         * the entire NFL database.
         */
        for (
            let tryNumber = 0;
            tryNumber < 8;
            tryNumber++
        ) {
            const offer =
                buildTradeMarketOfferFast({
                    roster,

                    benchPlayer,

                    rosterPools,

                    incomingPools,

                    giveTiers:
                        template.giveTiers,

                    receiveTiers:
                        template.receiveTiers,

                    includeBench:
                        false,

                    targetRatio:
                        1.75,

                    attempts:
                        56,
                });


            if (
                !offer
            ) {
                continue;
            }


            if (
                offer.ratio >
                bestRatio
            ) {
                bestRatio =
                    offer.ratio;

                bestJackpot = {
                    ...offer,
                    jackpot:
                        true,
                };
            }


            /*
             * If the deal is already 50%+ better by our internal
             * value calculation, it is absolutely jackpot-worthy.
             */
            if (
                offer.ratio >=
                1.50
            ) {
                return {
                    ...offer,
                    jackpot:
                        true,
                };
            }
        }


        /*
         * Keep the preferred template if it produced a huge deal,
         * instead of unnecessarily falling through to another shape.
         */
        if (
            bestJackpot &&
            bestJackpot.ratio >=
            1.30
        ) {
            return bestJackpot;
        }
    }


    /*
     * Tier structure itself is already extremely favorable. If we
     * found a legal jackpot-shaped trade, return the best one even
     * when averages make the numeric ratio slightly less dramatic.
     */
    return bestJackpot;
}


/* =========================================================
   OFFER SIGNATURE

   Prevents duplicate Trade Market deals.
   ========================================================= */

function getTradeOfferSignature(
    offer
) {
    const giveIds =
        offer.give
            .map(
                getPlayerId
            )
            .sort();

    const receiveIds =
        offer.receive
            .map(
                getPlayerId
            )
            .sort();

    return `${giveIds.join(
        "::"
    )}||${receiveIds.join(
        "::"
    )}`;
}


/* =========================================================
   FAST TRADE MARKET

   Still generates:
   - A stronger offer
   - A roughly fair offer
   - A potentially bad/trap offer

   But without hammering the entire NFL database.
   ========================================================= */

function generateTradeMarketOffers(
    roster,
    benchPlayer
) {
    const activeRoster =
        roster.filter(
            Boolean
        );


    /* =====================================================
       PREPARE CURRENT ROSTER
       ===================================================== */

    const rosterEntries =
        activeRoster.map(
            (player) => ({
                player,

                id:
                    getPlayerId(
                        player
                    ),

                tier:
                    getPlayerTier(
                        player
                    ),

                value:
                    getPlayerTradeValue(
                        player
                    ),
            })
        );


    const rosterPools =
        createTradePools(
            rosterEntries
        );


    const basePlayers =
        rosterPools.BASE;

    const goldPlayers =
        rosterPools.GOLD;

    const platinumPlayers =
        rosterPools.PLATINUM;


    /* =====================================================
       EXCLUDE PLAYERS YOU ALREADY OWN
       ===================================================== */

    const ownedIds =
        new Set(
            [
                ...activeRoster,
                benchPlayer,
            ]
                .filter(
                    Boolean
                )
                .map(
                    getPlayerId
                )
        );


    /*
     * This is the ONLY full player-pool pass during the click.
     *
     * Previously the pool could be filtered + shuffled
     * hundreds or thousands of times.
     */
    const incomingEntries =
        [];

    for (
        const entry of
        getTradeMarketPlayerCache()
    ) {
        if (
            !ownedIds.has(
                entry.id
            )
        ) {
            incomingEntries.push(
                entry
            );
        }
    }


    const incomingPools =
        createTradePools(
            incomingEntries
        );


    /* =====================================================
       TRADE TEMPLATES
       ===================================================== */

    const templates =
        [];


    /*
     * 2 Gold
     * for
     * Platinum + Base
     */
    if (
        goldPlayers.length >=
        2
    ) {
        templates.push({
            giveTiers: [
                "GOLD",
                "GOLD",
            ],

            receiveTiers: [
                "PLATINUM",
                "BASE",
            ],

            includeBench:
                false,
        });
    }


    /*
     * 2 Base
     * for
     * Gold + Base
     */
    if (
        basePlayers.length >=
        2
    ) {
        templates.push({
            giveTiers: [
                "BASE",
                "BASE",
            ],

            receiveTiers: [
                "GOLD",
                "BASE",
            ],

            includeBench:
                false,
        });
    }


    /*
     * Platinum + Base
     * for
     * 2 Gold
     */
    if (
        platinumPlayers.length >=
        1 &&
        basePlayers.length >=
        1
    ) {
        templates.push({
            giveTiers: [
                "PLATINUM",
                "BASE",
            ],

            receiveTiers: [
                "GOLD",
                "GOLD",
            ],

            includeBench:
                false,
        });
    }


    /*
     * Gold + Base
     * for
     * Gold + Base
     */
    if (
        goldPlayers.length >=
        1 &&
        basePlayers.length >=
        1
    ) {
        templates.push({
            giveTiers: [
                "GOLD",
                "BASE",
            ],

            receiveTiers: [
                "GOLD",
                "BASE",
            ],

            includeBench:
                false,
        });
    }


    /*
     * Special Bench deal:
     *
     * Give:
     * 2 Gold + Bench Player
     *
     * Receive:
     * Platinum + Gold
     */
    if (
        benchPlayer &&
        goldPlayers.length >=
        2
    ) {
        templates.push({
            giveTiers: [
                "GOLD",
                "GOLD",
            ],

            receiveTiers: [
                "PLATINUM",
                "GOLD",
            ],

            includeBench:
                true,
        });
    }


    /*
     * General fallback.
     *
     * Makes sure unusual rosters can still receive offers.
     */
    templates.push({
        giveTiers: [
            "ANY",
            "ANY",
        ],

        receiveTiers: [
            "ANY",
            "ANY",
        ],

        includeBench:
            false,
    });


    /* =====================================================
       OFFER QUALITY

       1.10 = generally favorable
       1.00 = around fair
       0.86 = potentially bad/trap
       ===================================================== */

    const qualityTargets = [
        1.10,
        1.00,
        0.86,
    ];


    const offers =
        [];

    const usedSignatures =
        new Set();


    /* =====================================================
       CREATE THREE DIFFERENT OFFERS
       ===================================================== */

    for (
        const targetRatio of
        qualityTargets
    ) {
        /*
         * Only a few templates exist, so shuffling this is cheap.
         */
        const availableTemplates =
            shuffle(
                templates
            );

        let selectedOffer =
            null;


        for (
            const template of
            availableTemplates
        ) {
            const offer =
                buildTradeMarketOfferFast({
                    roster,

                    benchPlayer,

                    rosterPools,

                    incomingPools,

                    ...template,

                    targetRatio,

                    attempts:
                        48,
                });


            if (
                !offer
            ) {
                continue;
            }


            const signature =
                getTradeOfferSignature(
                    offer
                );


            if (
                usedSignatures.has(
                    signature
                )
            ) {
                continue;
            }


            usedSignatures.add(
                signature
            );

            selectedOffer =
                offer;

            break;
        }


        if (
            selectedOffer
        ) {
            offers.push(
                selectedOffer
            );
        }
    }


    /* =====================================================
       FILL MISSING OFFERS
       ===================================================== */

    let fillAttempts =
        0;


    while (
        offers.length <
        3 &&
        fillAttempts <
        16
    ) {
        fillAttempts++;


        const offer =
            buildTradeMarketOfferFast({
                roster,

                benchPlayer,

                rosterPools,

                incomingPools,

                giveTiers: [
                    "ANY",
                    "ANY",
                ],

                receiveTiers: [
                    "ANY",
                    "ANY",
                ],

                includeBench:
                    false,

                targetRatio:
                    0.84 +
                    Math.random() *
                    0.30,

                attempts:
                    32,
            });


        if (
            !offer
        ) {
            continue;
        }


        const signature =
            getTradeOfferSignature(
                offer
            );


        if (
            usedSignatures.has(
                signature
            )
        ) {
            continue;
        }


        usedSignatures.add(
            signature
        );

        offers.push(
            offer
        );
    }


    /* =====================================================
       FINAL NORMAL MARKET

       The first three are always the normal market offers.
       ===================================================== */

    const finalOffers =
        shuffle(
            offers
        ).slice(
            0,
            3
        );


    /* =====================================================
       RARE FOURTH OFFER

       One independent 20% roll every time Trade Market opens.
       If it hits, OFFER 4 is a deliberately insane-value deal.
       ===================================================== */

    const JACKPOT_TRADE_CHANCE =
        0.20;


    if (
        Math.random() <
        JACKPOT_TRADE_CHANCE
    ) {
        const jackpotOffer =
            buildJackpotTradeOffer({
                roster,

                benchPlayer,

                rosterPools,

                incomingPools,
            });


        if (
            jackpotOffer
        ) {
            const jackpotSignature =
                getTradeOfferSignature(
                    jackpotOffer
                );

            const alreadyExists =
                finalOffers.some(
                    (
                        existingOffer
                    ) =>
                        getTradeOfferSignature(
                            existingOffer
                        ) ===
                        jackpotSignature
                );


            if (
                !alreadyExists
            ) {
                /*
                 * Push it after the normal three so when the event
                 * happens it visibly appears as OFFER 4.
                 */
                finalOffers.push(
                    jackpotOffer
                );
            }
        }
    }


    return finalOffers;
}
/* =========================================================
   ROUND 7+ ARENA ATMOSPHERE

   Camera flashes begin in Round 7. Rotating stage lights begin
   in Round 9. Pure React + CSS. No external artwork, image assets,
   video backgrounds, canvas libraries, or AI-generated art.
   ========================================================= */

function RoundArenaAtmosphere({ round }) {
    const numericRound = Number(round) || 1;

    /*
     * Crowd camera flashes begin in Round 7.
     * The large rotating stage lights still begin in Round 9,
     * so Rounds 7-8 only get the subtle crowd-energy buildup.
     */
    if (numericRound < 7) {
        return null;
    }

    const variant =
        numericRound > MAX_ROUNDS
            ? "endless"
            : `r${numericRound}`;

    /*
     * PERFORMANCE: only a few large beams are needed to sell the arena.
     * 3 beams for Rounds 9-10, 4 for Round 11+ keeps the look while
     * dramatically reducing the amount of full-screen GPU compositing.
     */
    const beamCount =
        numericRound < 9
            ? 0
            : numericRound >= 11
                ? 4
                : 3;

    /*
     * Keep the ambient pin lights sparse. Camera flashes are handled
     * separately so they can blink quickly without moving around.
     */
    const particleCount =
        numericRound < 9
            ? 0
            : numericRound >= 11
                ? 5
                : 4;

    /*
     * Tiny, far-away phone/camera flashes.
     * More spectators "take photos" as the Gauntlet gets deeper.
     * The positions and timing are deterministic, so React does not
     * continuously generate random values or run an animation loop.
     */
    const cameraFlashCount =
        numericRound > MAX_ROUNDS
            ? 10
            : numericRound === 12
                ? 10
                : numericRound === 11
                    ? 9
                    : numericRound === 10
                        ? 8
                        : numericRound === 9
                            ? 7
                            : numericRound === 8
                                ? 6
                                : 5;

    return (
        <div
            className={`gg-arena-atmosphere gg-arena-${variant}`}
            aria-hidden="true"
        >
            {Array.from({ length: beamCount }).map((_, index) => (
                <span
                    className={`gg-arena-beam gg-arena-beam-${index + 1}`}
                    key={`arena-beam-${index}`}
                />
            ))}

            <div className="gg-arena-horizon-lights" />

            <div className="gg-arena-camera-flashes">
                {Array.from({ length: cameraFlashCount }).map((_, index) => {
                    const x = 5 + ((index * 29 + 11) % 90);
                    const y = 8 + ((index * 47 + 9) % 76);
                    const size = 2 + (index % 2);
                    const duration = 9.5 + (index % 5) * 1.6;
                    const delay = -((index * 2.3 + 0.7) % 13);

                    return (
                        <span
                            className="gg-arena-camera-flash"
                            key={`arena-camera-flash-${index}`}
                            style={{
                                "--camera-x": `${x}%`,
                                "--camera-y": `${y}%`,
                                "--camera-size": `${size}px`,
                                "--camera-duration": `${duration}s`,
                                "--camera-delay": `${delay}s`,
                            }}
                        />
                    );
                })}
            </div>

            {Array.from({ length: particleCount }).map((_, index) => {
                const x = 4 + ((index * 37) % 92);
                const y = 8 + ((index * 53) % 78);
                const size = 2 + (index % 3);
                const duration = 5.5 + (index % 6) * 0.85;
                const delay = -(index % 7) * 0.7;

                return (
                    <span
                        className="gg-arena-particle"
                        key={`arena-particle-${index}`}
                        style={{
                            "--particle-x": `${x}%`,
                            "--particle-y": `${y}%`,
                            "--particle-size": `${size}px`,
                            "--particle-duration": `${duration}s`,
                            "--particle-delay": `${delay}s`,
                        }}
                    />
                );
            })}

            <div className="gg-arena-stage-glow" />
            <div className="gg-arena-vignette" />
        </div>
    );
}


const MemoizedRoundArenaAtmosphere =
    React.memo(
        RoundArenaAtmosphere
    );


/* =========================================================
   APP
   ========================================================= */

export default function App() {
    /* =====================================================
       GAME STATE
       ===================================================== */

    const [
        rosterSlots,
        setRosterSlots,
    ] =
        useState(
            Array(
                SLOT_POSITIONS.length
            ).fill(
                null
            )
        );

    const [
        locked,
        setLocked,
    ] =
        useState(
            false
        );

    const [
        round,
        setRound,
    ] =
        useState(
            1
        );

    const [
        wins,
        setWins,
    ] =
        useState(
            0
        );


    /* =====================================================
       ROUND STATE
       ===================================================== */

    const [
        roundSlots,
        setRoundSlots,
    ] =
        useState(
            []
        );

    const [
        placing,
        setPlacing,
    ] =
        useState(
            null
        );

    const [
        currentOpponent,
        setCurrentOpponent,
    ] =
        useState(
            []
        );

    const [
        opponentAssignments,
        setOpponentAssignments,
    ] =
        useState(
            []
        );

    const [
        roundResolved,
        setRoundResolved,
    ] =
        useState(
            false
        );

    const [
        categoryResults,
        setCategoryResults,
    ] =
        useState(
            []
        );

    const [
        roundResult,
        setRoundResult,
    ] =
        useState(
            null
        );

    const [
        revealedResultsCount,
        setRevealedResultsCount,
    ] =
        useState(
            0
        );

    const [
        resultsRevealDone,
        setResultsRevealDone,
    ] =
        useState(
            false
        );

    /* =====================================================
       PERKS
       ===================================================== */

    const [
        ownedPerks,
        setOwnedPerks,
    ] =
        useState(
            []
        );

    const [
        perkChoices,
        setPerkChoices,
    ] =
        useState(
            []
        );

    const [
        perkPhase,
        setPerkPhase,
    ] =
        useState(
            false
        );

    const [
        activePerk,
        setActivePerk,
    ] =
        useState(
            null
        );

    const [
        perkPlayerChoices,
        setPerkPlayerChoices,
    ] =
        useState(
            []
        );

    const [
        perkTarget,
        setPerkTarget,
    ] =
        useState(
            null
        );

    const [
        perkIncoming,
        setPerkIncoming,
    ] =
        useState(
            null
        );


    const [
        benchUnlocked,
        setBenchUnlocked,
    ] =
        useState(
            false
        );

    const [
        benchPlayer,
        setBenchPlayer,
    ] =
        useState(
            null
        );

    const [
        benchSwapMode,
        setBenchSwapMode,
    ] =
        useState(
            false
        );

    const [
        filmStudyAcquired,
        setFilmStudyAcquired,
    ] =
        useState(
            false
        );

    const [
        filmStudyReveals,
        setFilmStudyReveals,
    ] =
        useState(
            []
        );


    const [
        tePremiumRoundsRemaining,
        setTePremiumRoundsRemaining,
    ] =
        useState(
            0
        );

    const tePremiumActive =
        tePremiumRoundsRemaining >
        0;


    const [
        bestBallRoundsRemaining,
        setBestBallRoundsRemaining,
    ] =
        useState(
            0
        );

    const bestBallActive =
        bestBallRoundsRemaining >
        0;


    const [
        perfectVisionRoundActive,
        setPerfectVisionRoundActive,
    ] =
        useState(
            false
        );


    const [
        blackoutRoundActive,
        setBlackoutRoundActive,
    ] =
        useState(
            false
        );


    const [
        wildcardRosterUnlocked,
        setWildcardRosterUnlocked,
    ] =
        useState(
            false
        );

    wildcardRosterRulesEnabled =
        wildcardRosterUnlocked;


    const [
        weekScramblerAcquired,
        setWeekScramblerAcquired,
    ] =
        useState(
            false
        );

    const [
        weekScramblerUsesRemaining,
        setWeekScramblerUsesRemaining,
    ] =
        useState(
            0
        );


    const [
        perkPicksRemaining,
        setPerkPicksRemaining,
    ] =
        useState(
            1
        );


    const [
        pendingRoundModifiers,
        setPendingRoundModifiers,
    ] =
        useState({
            filmStudy:
                false,

            perfectVision:
                false,

            blackout:
                false,
        });


    const [
        tradeMarketOffers,
        setTradeMarketOffers,
    ] =
        useState(
            []
        );

    /* =====================================================
       LOCKED PERK ROLLS

       Randomized perk results are generated once per reward
       phase. Backing out of Booster Pack or Trade Market and
       reopening it restores the exact same players/offers.
       The cache resets only when the run advances to a new
       perk reward.
       ===================================================== */

    const [
        perkRollCache,
        setPerkRollCache,
    ] =
        useState(
            {}
        );


    const [
        divisionRivalDisplayTeam,
        setDivisionRivalDisplayTeam,
    ] =
        useState(
            null
        );

    const [
        divisionRivalSpinning,
        setDivisionRivalSpinning,
    ] =
        useState(
            false
        );

    const [
        secondWindAcquired,
        setSecondWindAcquired,
    ] =
        useState(
            false
        );

    const [
        secondWindReady,
        setSecondWindReady,
    ] =
        useState(
            false
        );


    /* =====================================================
       MAIN MENU / STATIC PAGES
       ===================================================== */

    const [
        menuPage,
        setMenuPage,
    ] =
        useState(
            "HOME"
        );


    /* =====================================================
       GAME OVER / RUN SUMMARY
       ===================================================== */

    const [
        runSummary,
        setRunSummary,
    ] =
        useState(
            null
        );


    /* =====================================================
       ENDLESS GAUNTLET

       Round 12 remains the official championship.
       Winning it unlocks the choice to retire as Champion
       or continue the same build into Round 13+.
       ===================================================== */

    const [
        endlessMode,
        setEndlessMode,
    ] =
        useState(
            false
        );

    const [
        championChoice,
        setChampionChoice,
    ] =
        useState(
            false
        );


    /* =====================================================
       HALL OF FAME
       ===================================================== */

    const [
        hallOfFame,
        setHallOfFame,
    ] =
        useState(
            () => {
                try {
                    const parsed = JSON.parse(
                        localStorage.getItem(
                            "gg_hof"
                        ) ||
                        "[]"
                    );

                    // Hall of Fame data never leaves this browser.
                    // Keep only a small bounded history to minimize stored data.
                    return Array.isArray(parsed)
                        ? parsed.slice(-25)
                        : [];
                }
                catch {
                    return [];
                }
            }
        );


    /* =====================================================
       DRAFT
       ===================================================== */

    const [
        roundOneMasterPool,
        setRoundOneMasterPool,
    ] =
        useState(
            () =>
                buildRoundOnePool()
        );

    const [
        draftOptions,
        setDraftOptions,
    ] =
        useState(
            () =>
                makeDraftOptions(
                    roundOneMasterPool
                )
        );

    const [
        selectedDraftPlayers,
        setSelectedDraftPlayers,
    ] =
        useState(
            []
        );

    const [
        draftConfirmed,
        setDraftConfirmed,
    ] =
        useState(
            false
        );


    /* =====================================================
       DRAFT SELECTION
       ===================================================== */

    const isPlayerSelected = (
        player
    ) => {
        const id =
            getPlayerId(
                player
            );

        return selectedDraftPlayers.some(
            (
                candidate
            ) =>
                getPlayerId(
                    candidate
                ) ===
                id
        );
    };


    const toggleDraftPlayer = (
        player
    ) => {
        if (
            locked ||
            draftConfirmed
        ) {
            return;
        }

        const id =
            getPlayerId(
                player
            );

        setSelectedDraftPlayers(
            (
                current
            ) => {
                const selected =
                    current.some(
                        (
                            candidate
                        ) =>
                            getPlayerId(
                                candidate
                            ) ===
                            id
                    );

                if (
                    selected
                ) {
                    return current.filter(
                        (
                            candidate
                        ) =>
                            getPlayerId(
                                candidate
                            ) !==
                            id
                    );
                }

                if (
                    current.length >=
                    7
                ) {
                    return current;
                }

                return [
                    ...current,
                    player,
                ];
            }
        );
    };

    /* =====================================================
      AUTO DRAFT

      Randomly selects a VALID 7-player roster from the
      12 player cards currently shown on the draft screen.

      This does NOT rank players by fantasy points.
      It is purely a random valid draft.
      ===================================================== */

    const autoDraft =
        () => {
            if (
                locked ||
                draftConfirmed
            ) {
                return;
            }

            const displayedPlayers =
                DRAFT_POSITIONS
                    .flatMap(
                        (
                            position
                        ) =>
                            draftOptions[
                            position
                            ] ||
                            []
                    )
                    .filter(
                        Boolean
                    );

            if (
                displayedPlayers.length <
                7
            ) {
                return;
            }

            const validDrafts =
                [];

            const currentDraftKey =
                selectedDraftPlayers
                    .map(
                        getPlayerId
                    )
                    .sort()
                    .join(
                        "|"
                    );


            const findValidDrafts =
                (
                    startIndex,
                    current
                ) => {
                    if (
                        current.length ===
                        7
                    ) {
                        const roster =
                            buildRoster(
                                current
                            );

                        if (
                            roster.every(
                                Boolean
                            )
                        ) {
                            validDrafts.push(
                                [
                                    ...current,
                                ]
                            );
                        }

                        return;
                    }

                    const playersNeeded =
                        7 -
                        current.length;

                    const playersRemaining =
                        displayedPlayers.length -
                        startIndex;

                    if (
                        playersRemaining <
                        playersNeeded
                    ) {
                        return;
                    }

                    for (
                        let index =
                            startIndex;

                        index <
                        displayedPlayers.length;

                        index++
                    ) {
                        current.push(
                            displayedPlayers[
                            index
                            ]
                        );

                        findValidDrafts(
                            index +
                            1,
                            current
                        );

                        current.pop();
                    }
                };


            findValidDrafts(
                0,
                []
            );

            if (
                validDrafts.length ===
                0
            ) {
                return;
            }

            const differentDrafts =
                validDrafts.filter(
                    (
                        draft
                    ) => {
                        const draftKey =
                            draft
                                .map(
                                    getPlayerId
                                )
                                .sort()
                                .join(
                                    "|"
                                );

                        return (
                            draftKey !==
                            currentDraftKey
                        );
                    }
                );

            const selectionPool =
                differentDrafts.length >
                    0
                    ? differentDrafts
                    : validDrafts;

            const randomDraft =
                selectionPool[
                Math.floor(
                    Math.random() *
                    selectionPool.length
                )
                ];

            setSelectedDraftPlayers(
                shuffle(
                    randomDraft
                )
            );
        };
    const previewRoster =
        buildRoster(
            selectedDraftPlayers
        );

    const draftIsValid =
        selectedDraftPlayers.length ===
        7 &&
        previewRoster.every(
            Boolean
        );


    const lockInDraft =
        () => {
            if (
                !draftIsValid
            ) {
                alert(
                    "Your starting lineup must contain QB, RB, RB, WR, WR, TE, and FLEX."
                );

                return;
            }

            setRosterSlots(
                previewRoster
            );

            setDraftConfirmed(
                true
            );
        };


    const editDraft =
        () => {
            setRosterSlots(
                Array(
                    SLOT_POSITIONS.length
                ).fill(
                    null
                )
            );

            setDraftConfirmed(
                false
            );
        };


    /* =====================================================
       ROUND SETUP
       ===================================================== */

    const setupRound = (
        roundNumber,
        userRoster,
        revealFilmStudy = false,
        {
            perfectVision = false,

            blackout = false,
        } = {}
    ) => {
        const setup =
            createSafeRoundSetup(
                userRoster,
                roundNumber
            );

        if (
            !setup
        ) {
            console.error(
                "Could not generate safe round."
            );

            alert(
                "The game could not create a valid round for this roster. Try again."
            );

            return false;
        }

        const blindWeekCount =
            getBlindWeekCount(
                roundNumber
            );


        let blindWeeks =
            new Set();


        if (
            blackout
        ) {
            blindWeeks =
                new Set(
                    setup.weeks
                );
        }
        else if (
            perfectVision
        ) {
            blindWeeks =
                new Set();
        }
        else {
            blindWeeks =
                new Set(
                    shuffle(
                        setup.weeks
                    ).slice(
                        0,
                        blindWeekCount
                    )
                );
        }


        setPerfectVisionRoundActive(
            Boolean(
                perfectVision
            )
        );


        setBlackoutRoundActive(
            Boolean(
                blackout
            )
        );

        setCurrentOpponent(
            setup.cpuRoster
        );

        setOpponentAssignments(
            setup.cpuAssignments
        );

        const shouldRevealFilmStudy =
            revealFilmStudy ||
            filmStudyAcquired;

        if (
            shouldRevealFilmStudy
        ) {
            const revealable =
                setup.cpuAssignments
                    .filter(
                        (
                            assignment
                        ) =>
                            !blindWeeks.has(
                                assignment.week
                            )
                    );

            setFilmStudyReveals(
                shuffle(
                    revealable
                )
                    .slice(
                        0,
                        2
                    )
                    .map(
                        (
                            assignment
                        ) => ({
                            playerId:
                                getPlayerId(
                                    assignment.player
                                ),

                            week:
                                assignment.week,

                            fantasyPoints:
                                Number(
                                    getWeekData(
                                        assignment.player,
                                        assignment.week
                                    )?.fantasyPointsPPR ??
                                    0
                                ),
                        })
                    )
            );
        }
        else {
            setFilmStudyReveals(
                []
            );
        }

        setRoundSlots(
            setup.weeks.map(
                (
                    week
                ) => ({
                    week,

                    isBlind:
                        blindWeeks.has(
                            week
                        ),

                    assigned:
                        null,

                    assignedIndex:
                        null,
                })
            )
        );

        setPlacing(
            null
        );

        setBenchSwapMode(
            false
        );

        setRoundResolved(
            false
        );

        setCategoryResults(
            []
        );

        setRoundResult(
            null
        );

        setRevealedResultsCount(
            0
        );

        setResultsRevealDone(
            false
        );

        return true;
    };


    const startGauntlet =
        () => {
            if (
                !draftConfirmed ||
                !rosterSlots.every(
                    Boolean
                )
            ) {
                return;
            }

            const success =
                setupRound(
                    1,
                    rosterSlots
                );

            if (
                success
            ) {
                setLocked(
                    true
                );
            }
        };


    /* =====================================================
       PLAYER PLACEMENT
       ===================================================== */

    const selectRosterPlayer = (
        player,
        rosterIndex
    ) => {
        if (
            roundResolved
        ) {
            return;
        }

        const alreadyPlaced =
            roundSlots.some(
                (
                    slot
                ) =>
                    slot.assignedIndex ===
                    rosterIndex
            );

        if (
            alreadyPlaced
        ) {
            return;
        }

        setPlacing({
            player,

            rosterIndex,
        });
    };


    const assignPlayerToWeek = (
        slot,
        slotIndex
    ) => {
        if (
            !placing ||
            roundResolved ||
            slot.assigned
        ) {
            return;
        }

        const weekData =
            getWeekData(
                placing.player,
                slot.week
            );

        if (
            !slot.isBlind &&
            (
                !weekData ||
                !weekData.opponent
            )
        ) {
            return;
        }

        const safePlacement =
            canFinishLineupAfterPlacement({
                roster:
                    rosterSlots,

                roundSlots,

                rosterIndex:
                    placing.rosterIndex,

                targetSlotIndex:
                    slotIndex,
            });

        if (
            !safePlacement
        ) {
            alert(
                "That placement would leave another player without a usable week. Choose a different week."
            );

            return;
        }

        setRoundSlots(
            (
                current
            ) => {
                const next =
                    current.map(
                        (
                            item
                        ) => ({
                            ...item,
                        })
                    );

                next[
                    slotIndex
                ] = {
                    ...next[
                    slotIndex
                    ],

                    assigned:
                        placing.player,

                    assignedIndex:
                        placing.rosterIndex,
                };

                return next;
            }
        );

        setPlacing(
            null
        );
    };


    const unassignPlayer = (
        slotIndex
    ) => {
        if (
            roundResolved
        ) {
            return;
        }

        setRoundSlots(
            (
                current
            ) => {
                const next =
                    current.map(
                        (
                            slot
                        ) => ({
                            ...slot,
                        })
                    );

                next[
                    slotIndex
                ] = {
                    ...next[
                    slotIndex
                    ],

                    assigned:
                        null,

                    assignedIndex:
                        null,
                };

                return next;
            }
        );

        setPlacing(
            null
        );
    };


    /* =====================================================
       WEEK SCRAMBLER ACTION
       ===================================================== */

    const useWeekScrambler =
        () => {
            if (
                !weekScramblerAcquired ||
                weekScramblerUsesRemaining <=
                0 ||
                roundResolved ||
                roundSlots.some(
                    (
                        slot
                    ) =>
                        Boolean(
                            slot.assigned
                        )
                )
            ) {
                return;
            }

            const confirmed =
                window.confirm(
                    `Scramble all 7 weeks? This uses 1 charge. ${weekScramblerUsesRemaining} charge${weekScramblerUsesRemaining === 1 ? "" : "s"} remaining.`
                );

            if (
                !confirmed
            ) {
                return;
            }

            const scrambled =
                createScrambledWeekSetup(
                    rosterSlots,
                    currentOpponent,
                    round,
                    roundSlots.map(
                        (
                            slot
                        ) =>
                            slot.week
                    )
                );

            if (
                !scrambled
            ) {
                window.alert(
                    "Week Scrambler could not find a different safe week board. No charge was used."
                );
                return;
            }

            const blindWeekCount =
                getBlindWeekCount(
                    round
                );

            let blindWeeks =
                new Set();

            if (
                blackoutRoundActive
            ) {
                blindWeeks =
                    new Set(
                        scrambled.weeks
                    );
            }
            else if (
                perfectVisionRoundActive
            ) {
                blindWeeks =
                    new Set();
            }
            else {
                blindWeeks =
                    new Set(
                        shuffle(
                            scrambled.weeks
                        ).slice(
                            0,
                            blindWeekCount
                        )
                    );
            }

            setOpponentAssignments(
                scrambled.cpuAssignments
            );

            if (
                filmStudyAcquired
            ) {
                const revealable =
                    scrambled.cpuAssignments
                        .filter(
                            (
                                assignment
                            ) =>
                                !blindWeeks.has(
                                    assignment.week
                                )
                        );

                setFilmStudyReveals(
                    shuffle(
                        revealable
                    )
                        .slice(
                            0,
                            2
                        )
                        .map(
                            (
                                assignment
                            ) => ({
                                playerId:
                                    getPlayerId(
                                        assignment.player
                                    ),

                                week:
                                    assignment.week,

                                fantasyPoints:
                                    Number(
                                        getWeekData(
                                            assignment.player,
                                            assignment.week
                                        )?.fantasyPointsPPR ??
                                        0
                                    ),
                            })
                        )
                );
            }
            else {
                setFilmStudyReveals(
                    []
                );
            }

            setRoundSlots(
                scrambled.weeks.map(
                    (
                        week
                    ) => ({
                        week,

                        isBlind:
                            blindWeeks.has(
                                week
                            ),

                        assigned:
                            null,

                        assignedIndex:
                            null,
                    })
                )
            );

            setPlacing(
                null
            );

            const nextUses =
                Math.max(
                    0,
                    weekScramblerUsesRemaining -
                    1
                );

            setWeekScramblerUsesRemaining(
                nextUses
            );

            setOwnedPerks(
                (
                    current
                ) =>
                    current.map(
                        (
                            ownedPerk
                        ) =>
                            ownedPerk.id ===
                                "WEEK_SCRAMBLER"
                                ? {
                                    ...ownedPerk,
                                    usesRemaining:
                                        nextUses,
                                }
                                : ownedPerk
                    )
            );
        };


    /* =====================================================
       AUTO LINEUP
       ===================================================== */

    const autoLineup =
        () => {
            if (
                roundResolved ||
                roundSlots.length !==
                7
            ) {
                return;
            }

            /*
             * Preserve every player the user has already placed.
             * Auto Lineup only solves the EMPTY Week Battle slots.
             */

            const lockedRosterIndexes =
                new Set(
                    roundSlots
                        .filter(
                            (
                                slot
                            ) =>
                                Boolean(
                                    slot.assigned
                                ) &&
                                slot.assignedIndex !==
                                null &&
                                slot.assignedIndex !==
                                undefined
                        )
                        .map(
                            (
                                slot
                            ) =>
                                Number(
                                    slot.assignedIndex
                                )
                        )
                );

            const remainingRosterEntries =
                rosterSlots
                    .map(
                        (
                            player,
                            rosterIndex
                        ) => ({
                            player,
                            rosterIndex,
                        })
                    )
                    .filter(
                        (
                            entry
                        ) =>
                            Boolean(
                                entry.player
                            ) &&
                            !lockedRosterIndexes.has(
                                entry.rosterIndex
                            )
                    );

            const remainingSlotEntries =
                roundSlots
                    .map(
                        (
                            slot,
                            slotIndex
                        ) => ({
                            slot,
                            slotIndex,
                        })
                    )
                    .filter(
                        (
                            entry
                        ) =>
                            !entry.slot.assigned
                    );

            /*
             * If all seven placements are already filled,
             * there is nothing for Auto Lineup to change.
             */

            if (
                remainingSlotEntries.length ===
                0
            ) {
                setPlacing(
                    null
                );

                return;
            }

            if (
                remainingRosterEntries.length !==
                remainingSlotEntries.length
            ) {
                alert(
                    "Auto Lineup could not find the remaining available players."
                );

                return;
            }

            const best =
                findBestRoundSlotAssignment(
                    remainingRosterEntries.map(
                        (
                            entry
                        ) =>
                            entry.player
                    ),

                    remainingSlotEntries.map(
                        (
                            entry
                        ) =>
                            entry.slot
                    ),

                    remainingRosterEntries.map(
                        (
                            entry
                        ) =>
                            entry.rosterIndex
                    ),

                    remainingSlotEntries.map(
                        (
                            entry
                        ) =>
                            entry.slotIndex
                    ),

                    bestBallActive
                        ? []
                        : filmStudyReveals,

                    tePremiumActive
                );

            if (
                !best
            ) {
                alert(
                    "Auto Lineup could not complete the remaining slots without changing your current placements."
                );

                return;
            }

            setRoundSlots(
                roundSlots.map(
                    (
                        slot,
                        slotIndex
                    ) => {
                        /*
                         * User placements are locked in place.
                         */

                        if (
                            slot.assigned
                        ) {
                            return slot;
                        }

                        const assignment =
                            best.assignments.find(
                                (
                                    candidate
                                ) =>
                                    Number(
                                        candidate.slotIndex
                                    ) ===
                                    Number(
                                        slotIndex
                                    )
                            );

                        return {
                            ...slot,

                            assigned:
                                assignment
                                    ?.player ||
                                null,

                            assignedIndex:
                                assignment
                                    ?.rosterIndex ??
                                null,
                        };
                    }
                )
            );

            setPlacing(
                null
            );
        };


    const clearLineup =
        () => {
            if (
                roundResolved
            ) {
                return;
            }

            setRoundSlots(
                (
                    current
                ) =>
                    current.map(
                        (
                            slot
                        ) => ({
                            ...slot,

                            assigned:
                                null,

                            assignedIndex:
                                null,
                        })
                    )
            );

            setPlacing(
                null
            );
        };


    const lineupComplete =
        roundSlots.length ===
        7 &&
        roundSlots.every(
            (
                slot
            ) =>
                Boolean(
                    slot.assigned
                )
        );


    /* =====================================================
       RESOLVE ROUND
       ===================================================== */

    const resolveRound =
        () => {
            if (
                !lineupComplete ||
                roundResolved
            ) {
                return;
            }

            let userCategoryWins =
                0;

            let cpuCategoryWins =
                0;

            let userTotal =
                0;

            let cpuTotal =
                0;


            const results =
                roundSlots.map(
                    (
                        slot
                    ) => {
                        const userPlayer =
                            slot.assigned;

                        const cpuAssignment =
                            opponentAssignments.find(
                                (
                                    assignment
                                ) =>
                                    Number(
                                        assignment.week
                                    ) ===
                                    Number(
                                        slot.week
                                    )
                            );

                        const cpuPlayer =
                            cpuAssignment
                                ?.player ||
                            null;

                        const userWeek =
                            getWeekData(
                                userPlayer,
                                slot.week
                            );

                        const cpuWeek =
                            getWeekData(
                                cpuPlayer,
                                slot.week
                            );

                        const userFantasy =
                            getUserWeekFantasyPoints(
                                userPlayer,
                                slot.week,
                                tePremiumActive
                            );

                        const cpuFantasy =
                            Number(
                                cpuWeek
                                    ?.fantasyPointsPPR ??
                                0
                            );

                        userTotal +=
                            userFantasy;

                        cpuTotal +=
                            cpuFantasy;

                        let winner =
                            "tie";

                        if (
                            userFantasy >
                            cpuFantasy
                        ) {
                            winner =
                                "user";

                            userCategoryWins++;
                        }
                        else if (
                            cpuFantasy >
                            userFantasy
                        ) {
                            winner =
                                "cpu";

                            cpuCategoryWins++;
                        }

                        return {
                            week:
                                slot.week,

                            userPlayer,

                            cpuPlayer,

                            userFantasy,

                            cpuFantasy,

                            winner,
                        };
                    }
                );


            const userWonRound =
                bestBallActive
                    ? (
                        userTotal ===
                            cpuTotal
                            ? userCategoryWins >
                            cpuCategoryWins
                            : userTotal >
                            cpuTotal
                    )
                    : (
                        userCategoryWins ===
                            cpuCategoryWins
                            ? userTotal >
                            cpuTotal
                            : userCategoryWins >
                            cpuCategoryWins
                    );


            setCategoryResults(
                results
            );

            setRoundResult({
                userCategoryWins,

                cpuCategoryWins,

                userTotal,

                cpuTotal,

                userWonRound,

                winCondition:
                    bestBallActive
                        ? "BEST_BALL"
                        : "WEEK_BATTLES",
            });

            /* =================================================
               SEQUENTIAL WEEK RESULT REVEAL

               Hide every resolved week first, then reveal the
               seven rows from top to bottom. The existing result
               layout stays exactly the same.
               ================================================= */

            setRevealedResultsCount(
                0
            );

            setResultsRevealDone(
                false
            );

            setRoundResolved(
                true
            );

            const firstResultDelay =
                120;

            const resultRevealStep =
                275;

            results.forEach(
                (
                    _result,
                    index
                ) => {
                    setTimeout(
                        () => {
                            setRevealedResultsCount(
                                index +
                                1
                            );
                        },

                        firstResultDelay +
                        index *
                        resultRevealStep
                    );
                }
            );

            setTimeout(
                () => {
                    setResultsRevealDone(
                        true
                    );
                },

                firstResultDelay +
                Math.max(
                    0,
                    results.length - 1
                ) *
                resultRevealStep +
                180
            );

            if (
                userWonRound
            ) {
                setWins(
                    (
                        current
                    ) =>
                        current +
                        1
                );
            }
        };


    /* =====================================================
       PERK REWARD
       ===================================================== */

    const clearPerkState =
        () => {
            setPerkPhase(
                false
            );

            setActivePerk(
                null
            );

            setPerkChoices(
                []
            );

            setPerkPlayerChoices(
                []
            );

            setPerkTarget(
                null
            );

            setPerkIncoming(
                null
            );

            setTradeMarketOffers(
                []
            );

            setPerkRollCache(
                {}
            );

            setDivisionRivalDisplayTeam(
                null
            );

            setDivisionRivalSpinning(
                false
            );


            setPerkPicksRemaining(
                1
            );


            setPendingRoundModifiers({
                filmStudy:
                    false,

                perfectVision:
                    false,

                blackout:
                    false,
            });
        };


    const addOwnedPerk = (
        perk,
        extra = {}
    ) => {
        if (
            !perk
        ) {
            return;
        }

        setOwnedPerks(
            (
                current
            ) => [
                    ...current,

                    {
                        id:
                            perk.id,

                        name:
                            perk.name,

                        icon:
                            perk.icon,

                        ...extra,
                    },
                ]
        );
    };


    const advanceAfterPerk = (
        nextRoster = rosterSlots,
        {
            filmStudy =
            false,

            perfectVision =
            false,

            blackout =
            false,
        } = {},
        consumedPerkId =
            activePerk?.id ||
            null
    ) => {
        const mergedModifiers = {
            filmStudy:
                Boolean(
                    pendingRoundModifiers
                        .filmStudy ||
                    filmStudy
                ),

            perfectVision:
                Boolean(
                    pendingRoundModifiers
                        .perfectVision ||
                    perfectVision
                ),

            blackout:
                Boolean(
                    pendingRoundModifiers
                        .blackout ||
                    blackout
                ),
        };


        if (
            mergedModifiers.blackout
        ) {
            mergedModifiers
                .perfectVision =
                false;
        }


        if (
            perkPicksRemaining >
            1
        ) {
            setRosterSlots(
                nextRoster
            );

            setPerkPicksRemaining(
                (
                    current
                ) =>
                    Math.max(
                        1,
                        current -
                        1
                    )
            );

            setPendingRoundModifiers(
                mergedModifiers
            );

            setPerkChoices(
                (
                    current
                ) =>
                    current.filter(
                        (
                            choice
                        ) => {
                            if (
                                consumedPerkId &&
                                choice.id ===
                                consumedPerkId
                            ) {
                                return false;
                            }

                            if (
                                perfectVision &&
                                choice.id ===
                                "BLACKOUT"
                            ) {
                                return false;
                            }

                            if (
                                blackout &&
                                choice.id ===
                                "PERFECT_VISION"
                            ) {
                                return false;
                            }

                            return true;
                        }
                    )
            );

            setActivePerk(
                null
            );

            setPerkPlayerChoices(
                []
            );

            setPerkTarget(
                null
            );

            setPerkIncoming(
                null
            );

            setTradeMarketOffers(
                []
            );

            setPerkRollCache(
                {}
            );

            setDivisionRivalDisplayTeam(
                null
            );

            setDivisionRivalSpinning(
                false
            );

            setPerkPhase(
                true
            );

            return true;
        }


        const nextRound =
            round +
            1;

        const success =
            setupRound(
                nextRound,
                nextRoster,
                mergedModifiers
                    .filmStudy,
                {
                    perfectVision:
                        mergedModifiers
                            .perfectVision,

                    blackout:
                        mergedModifiers
                            .blackout,
                }
            );

        if (
            !success
        ) {
            return false;
        }

        setRosterSlots(
            nextRoster
        );

        setRound(
            nextRound
        );

        clearPerkState();

        return true;
    };

    const showPerkRewardChoices =
        () => {
            const perkRewardRound =
                Math.min(
                    round,
                    MAX_ROUNDS -
                    1
                );


            const nextTePremiumRoundsRemaining =
                tePremiumRoundsRemaining >
                    0
                    ? Math.max(
                        0,
                        tePremiumRoundsRemaining -
                        1
                    )
                    : 0;


            const nextBestOfSevenRoundsRemaining =
                bestBallRoundsRemaining >
                    0
                    ? Math.max(
                        0,
                        bestBallRoundsRemaining -
                        1
                    )
                    : 0;


            if (
                nextTePremiumRoundsRemaining !==
                tePremiumRoundsRemaining
            ) {
                setTePremiumRoundsRemaining(
                    nextTePremiumRoundsRemaining
                );
            }


            if (
                nextBestOfSevenRoundsRemaining !==
                bestBallRoundsRemaining
            ) {
                setBestBallRoundsRemaining(
                    nextBestOfSevenRoundsRemaining
                );
            }


            setOwnedPerks(
                (
                    current
                ) =>
                    current
                        .filter(
                            (
                                ownedPerk
                            ) =>
                                ownedPerk.id !==
                                "PERFECT_VISION" &&
                                ownedPerk.id !==
                                "BLACKOUT" &&
                                !(
                                    ownedPerk.id ===
                                    "TE_PREMIUM" &&
                                    nextTePremiumRoundsRemaining ===
                                    0
                                ) &&
                                !(
                                    ownedPerk.id ===
                                    "BEST_BALL" &&
                                    nextBestOfSevenRoundsRemaining ===
                                    0
                                )
                        )
                        .map(
                            (
                                ownedPerk
                            ) => {
                                if (
                                    ownedPerk.id ===
                                    "TE_PREMIUM"
                                ) {
                                    return {
                                        ...ownedPerk,
                                        roundsRemaining:
                                            nextTePremiumRoundsRemaining,
                                    };
                                }

                                if (
                                    ownedPerk.id ===
                                    "BEST_BALL"
                                ) {
                                    return {
                                        ...ownedPerk,
                                        roundsRemaining:
                                            nextBestOfSevenRoundsRemaining,
                                    };
                                }

                                return ownedPerk;
                            }
                        )
            );


            const nextPerkChoices =
                generatePerkChoices(
                    perkRewardRound,
                    3,
                    {
                        secondWindAcquired,
                        benchUnlocked,
                        filmStudyAcquired,

                        tePremiumActive:
                            nextTePremiumRoundsRemaining >
                            0,

                        weekScramblerAcquired,

                        bestBallActive:
                            nextBestOfSevenRoundsRemaining >
                            0,

                        wildcardRosterUnlocked,
                    }
                );


            setPerkChoices(
                nextPerkChoices
            );

            setActivePerk(
                null
            );

            setPerkPlayerChoices(
                []
            );

            setPerkTarget(
                null
            );

            setPerkIncoming(
                null
            );

            setTradeMarketOffers(
                []
            );

            setPerkRollCache(
                {}
            );

            setPendingRoundModifiers({
                filmStudy:
                    false,

                perfectVision:
                    false,

                blackout:
                    false,
            });

            setPerkPhase(
                true
            );
        };


    const openPerkReward =
        () => {
            if (
                !roundResult
                    ?.userWonRound
            ) {
                return;
            }

            if (
                round ===
                MAX_ROUNDS &&
                !endlessMode
            ) {
                setChampionChoice(
                    true
                );

                return;
            }

            setPerkPicksRemaining(
                blackoutRoundActive
                    ? 2
                    : 1
            );

            showPerkRewardChoices();
        };


    const continueIntoEndless =
        () => {
            if (
                round !==
                MAX_ROUNDS ||
                !roundResult
                    ?.userWonRound
            ) {
                return;
            }

            setEndlessMode(
                true
            );

            setChampionChoice(
                false
            );

            /*
             * Round 12 still earns a perk. Taking or skipping it
             * advances through the normal perk flow into Round 13.
             */
            setPerkPicksRemaining(
                blackoutRoundActive
                    ? 2
                    : 1
            );

            showPerkRewardChoices();
        };


    const retireAsChampion =
        () => {
            setChampionChoice(
                false
            );

            finishRun(
                "Completed the Gauntlet"
            );
        };


    /* =====================================================
       UNIVERSAL SKIP

       Before a perk is selected:
       skip the reward entirely.

       After a perk is selected:
       skipping forfeits the reward and advances.
       ===================================================== */

    const skipPerk =
        () => {
            const lockedDivisionRival =
                perkRollCache
                    .DIVISION_RIVAL;

            if (
                lockedDivisionRival
                    ?.target
            ) {
                window.alert(
                    `Division Rival is locked to ${lockedDivisionRival.target.name}. Complete that rival trade before continuing.`
                );

                return;
            }

            if (
                activePerk
            ) {
                const confirmed =
                    window.confirm(
                        "Skip this perk? You will continue to the next round without receiving a reward."
                    );

                if (
                    !confirmed
                ) {
                    return;
                }
            }

            advanceAfterPerk(
                rosterSlots
            );
        };


    /* =====================================================
       BACK TO PERKS

       You may inspect a perk and return to the original
       reward choices as long as the perk has not actually
       been used / confirmed yet.
       ===================================================== */

    const chooseAnotherPerk =
        () => {
            const lockedDivisionRival =
                perkRollCache
                    .DIVISION_RIVAL;

            setActivePerk(
                null
            );

            /*
             * Once Division Rival has a selected player, backing out
             * may hide the screen but it must not erase the commitment.
             */
            if (
                lockedDivisionRival
                    ?.target
            ) {
                setPerkTarget(
                    lockedDivisionRival.target
                );

                setPerkPlayerChoices(
                    lockedDivisionRival.playerChoices ||
                    []
                );

                setDivisionRivalDisplayTeam(
                    lockedDivisionRival.rivalTeamCode ||
                    lockedDivisionRival.rivalFranchise ||
                    null
                );

                setPerkIncoming(
                    null
                );

                setTradeMarketOffers(
                    []
                );

                return;
            }

            setPerkTarget(
                null
            );

            setPerkIncoming(
                null
            );

            setPerkPlayerChoices(
                []
            );

            setTradeMarketOffers(
                []
            );
        };


    /* =====================================================
       CHOOSE PERK

       Choosing a card opens that perk. The player may return
       to the reward choices until the perk is actually used.
       ===================================================== */

    const choosePerk = (
        perk
    ) => {
        if (
            activePerk
        ) {
            return;
        }

        const lockedDivisionRival =
            perkRollCache
                .DIVISION_RIVAL;

        if (
            lockedDivisionRival
                ?.target &&
            perk.id !==
            "DIVISION_RIVAL"
        ) {
            window.alert(
                `Division Rival is already locked to ${lockedDivisionRival.target.name}. Finish that trade first.`
            );

            return;
        }

        if (
            perk.id ===
            "BEST_BALL"
        ) {
            if (
                bestBallRoundsRemaining >
                0
            ) {
                return;
            }

            setBestBallRoundsRemaining(
                2
            );

            addOwnedPerk(
                perk,
                {
                    temporary:
                        true,

                    roundsRemaining:
                        2,
                }
            );

            advanceAfterPerk(
                rosterSlots,
                {},
                perk.id
            );

            return;
        }


        if (
            perk.id ===
            "PERFECT_VISION"
        ) {
            addOwnedPerk(
                perk,
                {
                    temporary:
                        true,

                    roundsRemaining:
                        1,
                }
            );

            advanceAfterPerk(
                rosterSlots,
                {
                    perfectVision:
                        true,
                },
                perk.id
            );

            return;
        }


        if (
            perk.id ===
            "BLACKOUT"
        ) {
            addOwnedPerk(
                perk,
                {
                    temporary:
                        true,

                    roundsRemaining:
                        1,
                }
            );

            advanceAfterPerk(
                rosterSlots,
                {
                    blackout:
                        true,
                },
                perk.id
            );

            return;
        }


        if (
            perk.id ===
            "WILDCARD_ROSTER"
        ) {
            if (
                wildcardRosterUnlocked
            ) {
                return;
            }

            wildcardRosterRulesEnabled =
                true;

            setWildcardRosterUnlocked(
                true
            );

            addOwnedPerk(
                perk,
                {
                    permanent:
                        true,
                }
            );

            advanceAfterPerk(
                rosterSlots,
                {},
                perk.id
            );

            return;
        }


        if (
            perk.id ===
            "WEEK_SCRAMBLER"
        ) {
            if (
                weekScramblerAcquired
            ) {
                return;
            }

            setWeekScramblerAcquired(
                true
            );

            setWeekScramblerUsesRemaining(
                2
            );

            addOwnedPerk(
                perk,
                {
                    permanent:
                        true,

                    usesRemaining:
                        2,
                }
            );

            advanceAfterPerk(
                rosterSlots,
                {},
                perk.id
            );

            return;
        }


        if (
            perk.id ===
            "TE_PREMIUM"
        ) {
            if (
                tePremiumRoundsRemaining >
                0
            ) {
                return;
            }


            setTePremiumRoundsRemaining(
                3
            );


            addOwnedPerk(
                perk,
                {
                    temporary:
                        true,

                    roundsRemaining:
                        3,
                }
            );


            advanceAfterPerk(
                rosterSlots,
                {},
                perk.id
            );


            return;
        }


        if (
            perk.id ===
            "FILM_STUDY"
        ) {
            if (
                filmStudyAcquired
            ) {
                return;
            }

            setFilmStudyAcquired(
                true
            );

            addOwnedPerk(
                perk,
                {
                    permanent:
                        true,
                }
            );

            advanceAfterPerk(
                rosterSlots,
                {
                    filmStudy:
                        true,
                },
                perk.id
            );

            return;
        }

        setActivePerk(
            perk
        );

        setPerkTarget(
            null
        );

        setPerkIncoming(
            null
        );

        setPerkPlayerChoices(
            []
        );

        setTradeMarketOffers(
            []
        );


        if (
            perk.id ===
            "DIVISION_RIVAL"
        ) {
            const cachedDivisionRival =
                perkRollCache
                    .DIVISION_RIVAL;

            if (
                cachedDivisionRival
                    ?.target
            ) {
                setPerkTarget(
                    cachedDivisionRival.target
                );

                setDivisionRivalDisplayTeam(
                    cachedDivisionRival.rivalTeamCode ||
                    cachedDivisionRival.rivalFranchise ||
                    null
                );

                setPerkPlayerChoices(
                    cachedDivisionRival.playerChoices ||
                    []
                );
            }

            return;
        }


        const emptyBenchAvailable =
            benchUnlocked &&
            !benchPlayer;


        if (
            perk.id ===
            "BOOSTER_PACK"
        ) {
            const cachedBoosterRoll =
                perkRollCache[
                "BOOSTER_PACK"
                ];

            if (
                cachedBoosterRoll &&
                Array.isArray(
                    cachedBoosterRoll.playerChoices
                )
            ) {
                setPerkPlayerChoices(
                    cachedBoosterRoll.playerChoices
                );
            }
            else {
                const rolledBoosterChoices =
                    getBoosterPackChoices(
                        rosterSlots,
                        round,
                        emptyBenchAvailable
                    );

                setPerkPlayerChoices(
                    rolledBoosterChoices
                );

                setPerkRollCache(
                    (current) => ({
                        ...current,

                        BOOSTER_PACK: {
                            playerChoices:
                                rolledBoosterChoices,
                        },
                    })
                );
            }
        }


        if (
            perk.id ===
            "TRADING"
        ) {
            setPerkPlayerChoices(
                getTradingChoices(
                    rosterSlots,
                    currentOpponent
                )
            );
        }


        if (
            perk.id ===
            "TRADE_MARKET"
        ) {
            const cachedTradeMarketRoll =
                perkRollCache[
                "TRADE_MARKET"
                ];

            if (
                cachedTradeMarketRoll &&
                Array.isArray(
                    cachedTradeMarketRoll.offers
                )
            ) {
                setTradeMarketOffers(
                    cachedTradeMarketRoll.offers
                );
            }
            else {
                const rolledTradeMarketOffers =
                    generateTradeMarketOffers(
                        rosterSlots,
                        benchPlayer
                    );

                setTradeMarketOffers(
                    rolledTradeMarketOffers
                );

                setPerkRollCache(
                    (current) => ({
                        ...current,

                        TRADE_MARKET: {
                            offers:
                                rolledTradeMarketOffers,
                        },
                    })
                );
            }
        }
    };


    /* =====================================================
       LEGENDARY: DIVISION RIVAL
       ===================================================== */

    const chooseDivisionRivalTarget =
        async (
            player
        ) => {
            if (
                activePerk?.id !==
                "DIVISION_RIVAL" ||
                divisionRivalSpinning ||
                !player
            ) {
                return;
            }

            const existingRoll =
                perkRollCache
                    .DIVISION_RIVAL;

            if (
                existingRoll
                    ?.target
            ) {
                setPerkTarget(
                    existingRoll.target
                );

                setDivisionRivalDisplayTeam(
                    existingRoll.rivalTeamCode ||
                    existingRoll.rivalFranchise ||
                    null
                );

                setPerkPlayerChoices(
                    existingRoll.playerChoices ||
                    []
                );

                return;
            }

            const playerTeam =
                getPlayerTeam(
                    player
                );

            const season =
                getPlayerSeason(
                    player
                );

            const rivals =
                getDivisionRivals(
                    playerTeam
                );

            if (
                rivals.length !==
                3
            ) {
                window.alert(
                    "Division Rival could not identify this player's division."
                );

                return;
            }

            /*
             * Only rivals with at least one legal same-season swap
             * are eligible to become the final result. The slot still
             * visually cycles through all three rivals.
             */
            const rivalOptions =
                rivals
                    .map(
                        (
                            rivalFranchise
                        ) => {
                            const playerChoices =
                                getDivisionRivalPlayers(
                                    player,
                                    rivalFranchise,
                                    rosterSlots
                                );

                            const seasonTeam =
                                getPlayersForSeason(
                                    season
                                ).find(
                                    (
                                        candidate
                                    ) =>
                                        normalizeNFLFranchise(
                                            getPlayerTeam(
                                                candidate
                                            )
                                        ) ===
                                        rivalFranchise
                                );

                            return {
                                rivalFranchise,

                                rivalTeamCode:
                                    seasonTeam
                                        ? getPlayerTeam(
                                            seasonTeam
                                        )
                                        : rivalFranchise,

                                playerChoices,
                            };
                        }
                    )
                    .filter(
                        (
                            option
                        ) =>
                            option.playerChoices.length >
                            0
                    );

            if (
                rivalOptions.length ===
                0
            ) {
                window.alert(
                    "No legal Division Rival swap is available for this player."
                );

                return;
            }

            const winner =
                rivalOptions[
                Math.floor(
                    Math.random() *
                    rivalOptions.length
                )
                ];

            /*
             * COMMITMENT HAPPENS HERE.
             * The selected player and winning rival are stored BEFORE
             * the animation, so backing out cannot reroll either one.
             */
            setPerkTarget(
                player
            );

            setPerkRollCache(
                (
                    current
                ) => ({
                    ...current,

                    DIVISION_RIVAL: {
                        target:
                            player,

                        targetId:
                            getPlayerId(
                                player
                            ),

                        originalTeam:
                            playerTeam,

                        season,

                        rivalFranchise:
                            winner.rivalFranchise,

                        rivalTeamCode:
                            winner.rivalTeamCode,

                        playerChoices:
                            winner.playerChoices,
                    },
                })
            );

            setDivisionRivalSpinning(
                true
            );

            setPerkPlayerChoices(
                []
            );

            const delays = [
                65,
                65,
                70,
                70,
                75,
                80,
                85,
                95,
                105,
                120,
                140,
                165,
                195,
                235,
                285,
                350,
                440,
            ];

            let lastIndex =
                -1;

            for (
                let index =
                    0;

                index <
                delays.length;

                index++
            ) {
                let rivalIndex;

                do {
                    rivalIndex =
                        Math.floor(
                            Math.random() *
                            rivals.length
                        );
                }
                while (
                    rivalIndex ===
                    lastIndex &&
                    rivals.length >
                    1
                );

                lastIndex =
                    rivalIndex;

                const displayedFranchise =
                    rivals[
                    rivalIndex
                    ];

                const displayedSeasonTeam =
                    getPlayersForSeason(
                        season
                    ).find(
                        (
                            candidate
                        ) =>
                            normalizeNFLFranchise(
                                getPlayerTeam(
                                    candidate
                                )
                            ) ===
                            displayedFranchise
                    );

                setDivisionRivalDisplayTeam(
                    displayedSeasonTeam
                        ? getPlayerTeam(
                            displayedSeasonTeam
                        )
                        : displayedFranchise
                );

                await wait(
                    delays[
                    index
                    ]
                );
            }

            setDivisionRivalDisplayTeam(
                winner.rivalTeamCode
            );

            await wait(
                420
            );

            setDivisionRivalSpinning(
                false
            );

            setPerkPlayerChoices(
                winner.playerChoices
            );
        };


    const completeDivisionRivalTrade =
        (
            rivalPlayer
        ) => {
            const lockedRoll =
                perkRollCache
                    .DIVISION_RIVAL;

            if (
                activePerk?.id !==
                "DIVISION_RIVAL" ||
                divisionRivalSpinning ||
                !lockedRoll
                    ?.target ||
                !rivalPlayer
            ) {
                return;
            }

            if (
                !canTradePlayers(
                    rosterSlots,
                    lockedRoll.target,
                    rivalPlayer
                )
            ) {
                return;
            }

            finalizePerkSwap(
                lockedRoll.target,
                rivalPlayer
            );
        };


    /* =====================================================
       NORMAL 1-FOR-1 PERK SWAP
       ===================================================== */

    function finalizePerkSwap(
        playerOut,
        playerIn
    ) {
        if (
            !activePerk ||
            !playerOut ||
            !playerIn
        ) {
            return;
        }

        const nextRoster =
            replaceRosterPlayer(
                rosterSlots,
                playerOut,
                playerIn
            );

        if (
            !nextRoster ||
            !isRosterValid(
                nextRoster
            )
        ) {
            return;
        }

        addOwnedPerk(
            activePerk,
            {
                playerIn:
                    playerIn.name,

                playerOut:
                    playerOut.name,
            }
        );

        advanceAfterPerk(
            nextRoster
        );
    }


    /* =====================================================
       TEAMMATES
       ===================================================== */

    const chooseTeammatesTarget = (
        player
    ) => {
        if (
            activePerk?.id !==
            "TEAMMATES"
        ) {
            return;
        }

        setPerkTarget(
            player
        );

        setPerkIncoming(
            null
        );

        setPerkPlayerChoices(
            getTeammateChoices(
                player,
                rosterSlots,
                benchUnlocked &&
                !benchPlayer
            )
        );
    };


    const completeTeammatesTrade = (
        teammate
    ) => {
        if (
            activePerk?.id !==
            "TEAMMATES" ||
            !perkTarget
        ) {
            return;
        }

        if (
            benchUnlocked &&
            !benchPlayer
        ) {
            setBenchPlayer(
                teammate
            );

            addOwnedPerk(
                activePerk,
                {
                    playerIn:
                        teammate.name,

                    destination:
                        "Bench",
                }
            );

            advanceAfterPerk(
                rosterSlots
            );

            return;
        }

        if (
            !canTradePlayers(
                rosterSlots,
                perkTarget,
                teammate
            )
        ) {
            return;
        }

        finalizePerkSwap(
            perkTarget,
            teammate
        );
    };


    /* =====================================================
       TIME TRAVEL
       ===================================================== */

    const chooseTimeTravelTarget = (
        player
    ) => {
        if (
            activePerk?.id !==
            "TIME_TRAVEL"
        ) {
            return;
        }

        setPerkTarget(
            player
        );

        setPerkIncoming(
            null
        );

        setPerkPlayerChoices(
            getHistoricalChoices(
                player,
                rosterSlots
            )
        );
    };


    const completeTimeTravel = (
        historicalPlayer
    ) => {
        if (
            activePerk?.id !==
            "TIME_TRAVEL" ||
            !perkTarget
        ) {
            return;
        }

        if (
            !canTradePlayers(
                rosterSlots,
                perkTarget,
                historicalPlayer
            )
        ) {
            return;
        }

        finalizePerkSwap(
            perkTarget,
            historicalPlayer
        );
    };


    /* =====================================================
       BOOSTER / TRADING PLAYER SELECTION
       ===================================================== */

    const chooseIncomingPlayer = (
        player
    ) => {
        if (
            !activePerk
        ) {
            return;
        }

        if (
            activePerk.id !==
            "BOOSTER_PACK" &&
            activePerk.id !==
            "TRADING"
        ) {
            return;
        }

        /*
         * Booster Pack may fill an empty unlocked Bench.
         * Trading remains a real 1-for-1 trade.
         */

        if (
            activePerk.id ===
            "BOOSTER_PACK" &&
            benchUnlocked &&
            !benchPlayer
        ) {
            setBenchPlayer(
                player
            );

            addOwnedPerk(
                activePerk,
                {
                    playerIn:
                        player.name,

                    destination:
                        "Bench",
                }
            );

            advanceAfterPerk(
                rosterSlots
            );

            return;
        }

        setPerkIncoming(
            player
        );
    };


    const completeIncomingTrade = (
        playerOut
    ) => {
        if (
            !perkIncoming
        ) {
            return;
        }

        if (
            !canTradePlayers(
                rosterSlots,
                playerOut,
                perkIncoming
            )
        ) {
            return;
        }

        finalizePerkSwap(
            playerOut,
            perkIncoming
        );
    };


    /* =====================================================
       BENCH
       ===================================================== */

    const activateBenchPerk =
        () => {
            if (
                activePerk?.id !==
                "BENCH" ||
                benchUnlocked
            ) {
                return;
            }

            setBenchUnlocked(
                true
            );

            addOwnedPerk(
                activePerk
            );

            advanceAfterPerk(
                rosterSlots
            );
        };


    const swapBenchWithActive = (
        activeIndex
    ) => {
        if (
            !benchUnlocked ||
            !benchPlayer ||
            roundResolved ||
            roundSlots.some(
                (
                    slot
                ) =>
                    slot.assigned
            )
        ) {
            return;
        }

        const activePlayer =
            rosterSlots[
            activeIndex
            ];

        if (
            !activePlayer
        ) {
            return;
        }

        const nextRoster = [
            ...rosterSlots,
        ];

        nextRoster[
            activeIndex
        ] =
            benchPlayer;

        if (
            !isRosterValid(
                nextRoster
            )
        ) {
            alert(
                "That Bench swap would make your active roster invalid."
            );

            return;
        }

        setBenchPlayer(
            activePlayer
        );

        setRosterSlots(
            nextRoster
        );

        setBenchSwapMode(
            false
        );
    };


    /* =====================================================
       TRADE MARKET
       ===================================================== */

    const acceptTradeMarketOffer = (
        offer
    ) => {
        if (
            activePerk?.id !==
            "TRADE_MARKET" ||
            !offer ||
            !offer.nextRoster
        ) {
            return;
        }

        if (
            !isRosterValid(
                offer.nextRoster
            )
        ) {
            return;
        }

        if (
            offer.consumesBench
        ) {
            setBenchPlayer(
                null
            );
        }

        addOwnedPerk(
            activePerk,
            {
                playersOut:
                    offer.give
                        .map(
                            (
                                player
                            ) =>
                                player.name
                        )
                        .join(
                            ", "
                        ),

                playersIn:
                    offer.receive
                        .map(
                            (
                                player
                            ) =>
                                player.name
                        )
                        .join(
                            ", "
                        ),
            }
        );

        advanceAfterPerk(
            offer.nextRoster
        );
    };


    /* =====================================================
       SECOND WIND
       ===================================================== */

    const activateSecondWind =
        () => {
            if (
                activePerk?.id !==
                "SECOND_WIND" ||
                secondWindAcquired
            ) {
                return;
            }

            setSecondWindAcquired(
                true
            );

            setSecondWindReady(
                true
            );

            addOwnedPerk(
                activePerk
            );

            advanceAfterPerk(
                rosterSlots
            );
        };


    const handleRoundLoss =
        () => {
            if (
                secondWindReady
            ) {
                setSecondWindReady(
                    false
                );

                const success =
                    setupRound(
                        round,
                        rosterSlots,
                        false
                    );

                if (
                    !success
                ) {
                    finishRun(
                        `Lost in Round ${round}`
                    );
                }

                return;
            }

            finishRun(
                endlessMode
                    ? `Endless run ended in Round ${round}`
                    : `Lost in Round ${round}`
            );
        };


    const clearHallOfFame = () => {
        setHallOfFame([]);

        try {
            localStorage.removeItem(
                "gg_hof"
            );
        }
        catch {
            // Ignore localStorage errors.
        }
    };


    /* =====================================================
       FINISH RUN
       ===================================================== */

    const finishRun = (
        note
    ) => {
        const completed =
            note ===
            "Completed the Gauntlet" ||
            endlessMode;

        const run = {
            wins,

            roundReached:
                round,

            champion:
                completed,

            endless:
                endlessMode,

            roster:
                rosterSlots
                    .filter(
                        Boolean
                    )
                    .map(
                        (
                            player
                        ) => ({
                            name:
                                player.name,

                            year:
                                player.year ||
                                player.season,
                        })
                    ),

            perks:
                ownedPerks,

            note,
        };

        const nextHall = [
            ...hallOfFame,
            run,
        ].slice(-25);

        setHallOfFame(
            nextHall
        );

        try {
            localStorage.setItem(
                "gg_hof",
                JSON.stringify(
                    nextHall
                )
            );
        }
        catch {
            // Ignore localStorage errors.
        }

        /* =================================================
           Preserve the finished run on screen.

           We intentionally DO NOT reset the game here.
           The player gets to see their final roster,
           perks, round score, and run progress first.
           ================================================= */

        setRunSummary({
            completed,

            endless:
                endlessMode,

            note,

            roundReached:
                round,

            wins,

            finalResult:
                roundResult
                    ? {
                        ...roundResult,
                    }
                    : null,

            roster:
                rosterSlots.map(
                    (
                        player
                    ) =>
                        player
                            ? {
                                ...player,
                            }
                            : null
                ),

            benchPlayer:
                benchPlayer
                    ? {
                        ...benchPlayer,
                    }
                    : null,

            perks:
                ownedPerks.map(
                    (
                        perk
                    ) => ({
                        ...perk,
                    })
                ),
        });
    };


    /* =====================================================
       START NEW RUN

       This used to happen immediately inside finishRun().
       It now happens only after the player leaves the
       Game Over / Champion screen.
       ===================================================== */

    const startNewRun =
        () => {
            setRunSummary(
                null
            );

            setEndlessMode(
                false
            );

            setChampionChoice(
                false
            );

            setMenuPage(
                "DRAFT"
            );

            setLocked(
                false
            );

            setRound(
                1
            );

            setWins(
                0
            );

            setRosterSlots(
                Array(
                    SLOT_POSITIONS.length
                ).fill(
                    null
                )
            );

            setCurrentOpponent(
                []
            );

            setOpponentAssignments(
                []
            );

            setRoundSlots(
                []
            );

            setRoundResolved(
                false
            );

            setCategoryResults(
                []
            );

            setRoundResult(
                null
            );

            setRevealedResultsCount(
                0
            );

            setResultsRevealDone(
                false
            );

            setPlacing(
                null
            );

            setSelectedDraftPlayers(
                []
            );

            setDraftConfirmed(
                false
            );

            setOwnedPerks(
                []
            );

            setPerkChoices(
                []
            );

            setPerkPhase(
                false
            );

            setActivePerk(
                null
            );

            setPerkPlayerChoices(
                []
            );

            setPerkTarget(
                null
            );

            setPerkIncoming(
                null
            );

            setBenchUnlocked(
                false
            );

            setBenchPlayer(
                null
            );

            setBenchSwapMode(
                false
            );

            setFilmStudyAcquired(
                false
            );

            setFilmStudyReveals(
                []
            );


            setTePremiumRoundsRemaining(
                0
            );


            setBestBallRoundsRemaining(
                0
            );

            setPerfectVisionRoundActive(
                false
            );

            setBlackoutRoundActive(
                false
            );

            setWildcardRosterUnlocked(
                false
            );

            wildcardRosterRulesEnabled =
                false;

            setWeekScramblerAcquired(
                false
            );

            setWeekScramblerUsesRemaining(
                0
            );

            setPerkPicksRemaining(
                1
            );

            setPendingRoundModifiers({
                filmStudy:
                    false,

                perfectVision:
                    false,

                blackout:
                    false,
            });


            setTradeMarketOffers(
                []
            );

            setPerkRollCache(
                {}
            );

            setDivisionRivalDisplayTeam(
                null
            );

            setDivisionRivalSpinning(
                false
            );

            setSecondWindAcquired(
                false
            );

            setSecondWindReady(
                false
            );

            const newPool =
                buildRoundOnePool();

            setRoundOneMasterPool(
                newPool
            );

            setDraftOptions(
                makeDraftOptions(
                    newPool
                )
            );
        };


    const returnToMainMenuAfterRun =
        () => {
            startNewRun();

            setMenuPage(
                "HOME"
            );
        };


    /* =====================================================
       ROUND 12 CHAMPION DECISION
       ===================================================== */

    if (
        championChoice
    ) {
        return (
            <div className="App game-over-page game-over-page-champion">
                <header className="topBar game-over-topbar">
                    <div className="topBarInner">
                        <div className="brand">
                            <div className="logo">
                                GG
                            </div>

                            <h2>
                                Gridiron Gauntlet
                            </h2>
                        </div>

                        <div className="controls">
                            <div className="round-header-record">
                                GAUNTLET COMPLETE
                            </div>

                            <div>
                                {wins} WINS
                            </div>
                        </div>
                    </div>
                </header>

                <main className="game-over-screen">
                    <section className="game-over-hero">
                        <span className="game-over-kicker">
                            GAUNTLET CONQUERED
                        </span>

                        <h1>
                            CHAMPION
                        </h1>

                        <p>
                            You survived all {MAX_ROUNDS} championship rounds.
                            Your title is secured. Retire the run here, or keep
                            the same roster, bench, and perks and enter the
                            Endless Gauntlet.
                        </p>
                    </section>

                    <section className="game-over-summary-grid">
                        <div className="game-over-stat-card">
                            <span>
                                CHAMPIONSHIP
                            </span>

                            <strong>
                                CLEARED
                            </strong>
                        </div>

                        <div className="game-over-stat-card">
                            <span>
                                ROUNDS WON
                            </span>

                            <strong>
                                {wins}
                            </strong>
                        </div>

                        <div className="game-over-stat-card">
                            <span>
                                NEXT
                            </span>

                            <strong>
                                ROUND {ENDLESS_START_ROUND}
                            </strong>
                        </div>
                    </section>

                    <section className="game-over-section">
                        <div className="game-over-section-heading">
                            <span>
                                ENDLESS GAUNTLET
                            </span>

                            <h2>
                                HOW FAR CAN YOU GO?
                            </h2>
                        </div>

                        <p>
                            Round {ENDLESS_START_ROUND}+ keeps the run alive.
                            Opponents continue using optimal lineups while
                            their draft pool gets stronger the deeper you go.
                        </p>
                    </section>

                    <div className="game-over-actions">
                        <button
                            className="game-over-new-run-button"
                            onClick={
                                continueIntoEndless
                            }
                        >
                            🔥 CONTINUE GAUNTLET
                        </button>

                        <button
                            className="game-over-menu-button"
                            onClick={
                                retireAsChampion
                            }
                        >
                            🏆 RETIRE AS CHAMPION
                        </button>
                    </div>
                </main>
            </div>
        );
    }


    /* =====================================================
       GAME OVER / CHAMPION PAGE
       ===================================================== */

    if (
        runSummary
    ) {
        const finalResult =
            runSummary.finalResult;

        const finalUserWins =
            finalResult
                ?.userCategoryWins ??
            0;

        const finalCpuWins =
            finalResult
                ?.cpuCategoryWins ??
            0;

        const finalUserTotal =
            Number(
                finalResult
                    ?.userTotal ??
                0
            );

        const finalCpuTotal =
            Number(
                finalResult
                    ?.cpuTotal ??
                0
            );

        return (
            <div
                className={[
                    "App",
                    "game-over-page",
                    runSummary.completed
                        ? "game-over-page-champion"
                        : "game-over-page-loss",
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        " "
                    )}
            >
                <header className="topBar game-over-topbar">
                    <div className="topBarInner">
                        <div className="brand">
                            <div className="logo">
                                GG
                            </div>

                            <h2>
                                Gridiron Gauntlet
                            </h2>
                        </div>

                        <div className="controls">
                            <div className="round-header-record">
                                {runSummary.endless
                                    ? `ENDLESS ROUND ${runSummary.roundReached}`
                                    : runSummary.completed
                                        ? "GAUNTLET COMPLETE"
                                        : `ROUND ${runSummary.roundReached}`}
                            </div>

                            <div>
                                {runSummary.wins} WINS
                            </div>
                        </div>
                    </div>
                </header>

                <main className="game-over-screen">
                    <section className="game-over-hero">
                        <span className="game-over-kicker">
                            {runSummary.endless
                                ? "ENDLESS RUN OVER"
                                : runSummary.completed
                                    ? "GAUNTLET CONQUERED"
                                    : "RUN OVER"}
                        </span>

                        <h1>
                            {runSummary.completed
                                ? "CHAMPION"
                                : "ELIMINATED"}
                        </h1>

                        <p>
                            {runSummary.endless
                                ? `Champion secured. Your Endless Gauntlet run reached Round ${runSummary.roundReached}.`
                                : runSummary.completed
                                    ? `You survived all ${MAX_ROUNDS} rounds and conquered the Gridiron Gauntlet.`
                                    : `Your run ended in Round ${runSummary.roundReached}. Here is the squad that carried you this far.`}
                        </p>
                    </section>

                    <section className="game-over-summary-grid">
                        <div className="game-over-stat-card">
                            <span>
                                ROUND REACHED
                            </span>

                            <strong>
                                {runSummary.roundReached}
                                {!runSummary.endless && (
                                    <small>
                                        /{MAX_ROUNDS}
                                    </small>
                                )}
                            </strong>
                        </div>

                        <div className="game-over-stat-card">
                            <span>
                                ROUNDS WON
                            </span>

                            <strong>
                                {runSummary.wins}
                            </strong>
                        </div>

                        <div className="game-over-stat-card game-over-stat-score">
                            <span>
                                {finalResult?.winCondition ===
                                    "BEST_BALL"
                                    ? "FINAL MODE"
                                    : "FINAL ROUND"}
                            </span>

                            <strong>
                                {finalResult?.winCondition ===
                                    "BEST_BALL"
                                    ? "BEST BALL"
                                    : (
                                        <>
                                            {finalUserWins}
                                            <small>
                                                -
                                            </small>
                                            {finalCpuWins}
                                        </>
                                    )}
                            </strong>
                        </div>

                        <div className="game-over-stat-card">
                            <span>
                                FINAL FP
                            </span>

                            <strong className="game-over-fp-value">
                                {finalUserTotal.toFixed(
                                    1
                                )}

                                <small>
                                    -
                                </small>

                                {finalCpuTotal.toFixed(
                                    1
                                )}
                            </strong>
                        </div>
                    </section>

                    <section className="game-over-section">
                        <div className="game-over-section-heading">
                            <span>
                                FINAL LINEUP
                            </span>

                            <h2>
                                YOUR FINAL ROSTER
                            </h2>
                        </div>

                        <div className="game-over-roster-grid">
                            {runSummary.roster.map(
                                (
                                    player,
                                    index
                                ) =>
                                    player ? (
                                        <div
                                            className="game-over-roster-card"
                                            key={`${getPlayerId(player)}-${index}`}
                                        >
                                            <div className="game-over-roster-position">
                                                {
                                                    wildcardRosterUnlocked
                                                        ? "WILD"
                                                        : SLOT_POSITIONS[
                                                        index
                                                        ]
                                                }
                                            </div>

                                            <PlayerCard
                                                player={
                                                    player
                                                }
                                                variant="draft"
                                            />
                                        </div>
                                    ) : null
                            )}
                        </div>

                        {runSummary.benchPlayer && (
                            <div className="game-over-bench">
                                <div className="game-over-bench-label">
                                    BENCH
                                </div>

                                <PlayerCard
                                    player={
                                        runSummary.benchPlayer
                                    }
                                    variant="draft"
                                />
                            </div>
                        )}
                    </section>

                    <section className="game-over-section game-over-perk-section">
                        <div className="game-over-section-heading">
                            <span>
                                RUN BUILD
                            </span>

                            <h2>
                                PERKS EARNED
                            </h2>
                        </div>

                        {runSummary.perks.length >
                            0 ? (
                            <div className="game-over-perks">
                                {runSummary.perks.map(
                                    (
                                        perk,
                                        index
                                    ) => (
                                        <div
                                            className="game-over-perk-chip"
                                            key={`${perk.id || perk.name}-${index}`}
                                        >
                                            <span>
                                                {perk.icon ||
                                                    "★"}
                                            </span>

                                            <strong>
                                                {perk.name ||
                                                    "Perk"}
                                            </strong>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="game-over-no-perks">
                                No perks earned this run.
                            </div>
                        )}
                    </section>

                    <div className="game-over-actions">
                        <button
                            className="game-over-new-run-button"
                            onClick={
                                startNewRun
                            }
                        >
                            START NEW RUN
                        </button>

                        <button
                            className="game-over-menu-button"
                            onClick={
                                returnToMainMenuAfterRun
                            }
                        >
                            MAIN MENU
                        </button>
                    </div>
                </main>
            </div>
        );
    }


    /* =====================================================
       MAIN TITLE SCREEN
       ===================================================== */

    if (
        !locked &&
        menuPage ===
        "HOME"
    ) {
        return (
            <div className="App title-page">
                <main className="title-screen">
                    <div className="title-stadium-light title-stadium-light-left" />
                    <div className="title-stadium-light title-stadium-light-right" />

                    <section className="title-card">
                        <div className="title-logo-mark">
                            GG
                        </div>

                        <span className="title-kicker">
                            HISTORICAL FANTASY FOOTBALL GAUNTLET
                        </span>

                        <h1 className="title-name">
                            <span>
                                GRIDIRON
                            </span>

                            <strong>
                                GAUNTLET
                            </strong>
                        </h1>

                        <p className="title-description">
                            Draft across NFL history. Place your players into seven weekly battles, survive Blind Weeks, collect perks, and conquer all nine rounds.
                        </p>

                        <div className="title-actions">
                            <button
                                className="title-start-button"
                                onClick={() =>
                                    setMenuPage(
                                        "DRAFT"
                                    )
                                }
                            >
                                START RUN
                            </button>

                            <button
                                className="title-secondary-button"
                                onClick={() =>
                                    setMenuPage(
                                        "HOW_TO_PLAY"
                                    )
                                }
                            >
                                HOW TO PLAY
                            </button>

                            <button
                                className="title-secondary-button"
                                onClick={() =>
                                    setMenuPage(
                                        "HALL_OF_FAME"
                                    )
                                }
                            >
                                HALL OF FAME
                            </button>

                            <button
                                className="title-secondary-button"
                                onClick={() =>
                                    setMenuPage(
                                        "ABOUT"
                                    )
                                }
                            >
                                ABOUT
                            </button>
                        </div>

                        <div className="title-mode-strip">
                            <span>
                                2010-2025
                            </span>

                            <i />

                            <span>
                                FULL PPR
                            </span>

                            <i />

                            <span>
                                12 ROUNDS
                            </span>
                        </div>

                        <nav
                            className="title-legal-links"
                            aria-label="Legal and privacy"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setMenuPage(
                                        "PRIVACY"
                                    )
                                }
                            >
                                PRIVACY
                            </button>

                            <span aria-hidden="true">
                                •
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setMenuPage(
                                        "TERMS"
                                    )
                                }
                            >
                                TERMS
                            </button>

                            <span aria-hidden="true">
                                •
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setMenuPage(
                                        "DISCLAIMER"
                                    )
                                }
                            >
                                DISCLAIMER
                            </button>

                            <span aria-hidden="true">
                                •
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setMenuPage(
                                        "LICENSES"
                                    )
                                }
                            >
                                LICENSES
                            </button>
                        </nav>

                        <div className="title-creator-line">
                            <span>
                                DESIGNED &amp; DEVELOPED BY
                            </span>

                            <span>
                                {CREATOR_NAME}
                            </span>
                        </div>
                    </section>
                </main>
            </div>
        );
    }


    /* =====================================================
       HOW TO PLAY
       ===================================================== */

    if (
        !locked &&
        menuPage ===
        "HOW_TO_PLAY"
    ) {
        const howToPlaySteps = [
            {
                number:
                    "01",
                title:
                    "DRAFT 7 PLAYER-SEASONS",
                text:
                    "Build a valid starting roster from historical NFL seasons: QB, RB, RB, WR, WR, TE, and one FLEX from RB/WR/TE.",
                image: screenshotDraft,
            },
            {
                number:
                    "02",
                title:
                    "ASSIGN THE WEEK BATTLES",
                text:
                    "Each round contains seven historical weeks. Place exactly one active roster player into each battle. Visible weeks only accept players who actually played that week.",
                image: screenshotBattles,
            },
            {
                number:
                    "03",
                title:
                    "WIN WITH REAL FULL-PPR DATA",
                text:
                    "Every matchup uses the player's real historical weekly production. Win more of the seven battles than the CPU; total fantasy points decide the round when the battle count is tied.",
            },
            {
                number:
                    "04",
                title:
                    "READ THE BLIND WEEKS",
                text:
                    "Rounds 1-3 have no Blind Weeks, Rounds 4-6 contain one, and Rounds 7-12 contain two. The week, matchup, availability, and fantasy score stay hidden until you lock the lineup.",
            },
            {
                number:
                    "05",
                title:
                    "EVOLVE YOUR ROSTER WITH PERKS",
                text:
                    "Winning rounds can unlock Time Travel, Teammates, Trading, Booster Packs, Film Study, Trade Market, Bench, or the rare Second Wind perk.",
            },
            {
                number:
                    "06",
                title:
                    "USE THE BENCH & SECOND WIND",
                text:
                    "Bench permanently unlocks one reserve slot for between-round swaps. Second Wind gives one extra life and rebuilds the same round against a completely new opponent after a loss.",
            },
            {
                number:
                    "07",
                title:
                    "SURVIVE ALL 12 ROUNDS",
                text:
                    "The first rounds are more forgiving, but the CPU becomes more selective and optimized as the run continues. Round 12 uses exact optimal lineup logic, so conquering the final means your roster survived the full Gauntlet.",
            },
        ];

        return (
            <div className="App info-page">
                <header className="info-topbar">
                    <button
                        className="info-back-button"
                        onClick={() =>
                            setMenuPage(
                                "HOME"
                            )
                        }
                    >
                        ← MAIN MENU
                    </button>

                    <div className="info-brand">
                        GG
                    </div>
                </header>

                <main className="info-screen">
                    <div className="info-heading">
                        <span>
                            QUICK GUIDE
                        </span>

                        <h1>
                            HOW TO PLAY
                        </h1>

                        <p>
                            Everything you need to survive a complete run.
                        </p>
                    </div>

                    <div className="how-to-play-grid">
                        {howToPlaySteps.map(
                            (
                                step
                            ) => (
                                <article
                                    className="how-to-play-card"
                                    key={
                                        step.number
                                    }
                                >
                                    {step.image && (
                                        <img
                                            src={step.image}
                                            alt={step.title}
                                            className="how-to-play-screenshot"
                                        />
                                    )}
                                    <span className="how-to-play-number">
                                        {step.number}
                                    </span>

                                    <h2>
                                        {step.title}
                                    </h2>

                                    <p>
                                        {step.text}
                                    </p>
                                </article>
                            )
                        )}
                    </div>

                    <button
                        className="info-primary-button"
                        onClick={() =>
                            setMenuPage(
                                "DRAFT"
                            )
                        }
                    >
                        START A RUN
                    </button>
                </main>
            </div>
        );
    }


    /* =====================================================
       ABOUT PAGE
       ===================================================== */

    if (
        !locked &&
        menuPage ===
        "ABOUT"
    ) {
        return (
            <div className="App info-page about-page">
                <header className="info-topbar">
                    <button
                        className="info-back-button"
                        onClick={() =>
                            setMenuPage(
                                "HOME"
                            )
                        }
                    >
                        ← MAIN MENU
                    </button>

                    <div className="info-brand">
                        GG
                    </div>
                </header>

                <main className="info-screen about-screen">
                    <div className="info-heading">
                        <span>
                            ABOUT THE PROJECT
                        </span>

                        <h1>
                            GRIDIRON GAUNTLET
                        </h1>
                    </div>

                    <section className="about-card">
                        <div className="about-creator-mark">
                            GG
                        </div>

                        <div className="about-copy">
                            <span>
                                DESIGNED &amp; DEVELOPED BY
                            </span>

                            <h2>
                                {CREATOR_NAME}
                            </h2>

                            <p>
                                I created Gridiron Gauntlet as an original fantasy-football strategy game built around historical NFL player-seasons, real weekly production, roster construction, hidden information, and progressively harder CPU opponents.
                            </p>

                            <p>
                                The project combines frontend game development with data processing, constraint-based lineup search, historical player lookup, randomized game-state generation, and persistent run progression.
                            </p>
                        </div>
                    </section>

                    <section className="about-tech-section">
                        <div className="about-section-heading">
                            <span>
                                UNDER THE HOOD
                            </span>

                            <h2>
                                BUILT AS A DATA-DRIVEN GAME
                            </h2>
                        </div>

                        <div className="about-tech-grid">
                            <article>
                                <strong>
                                    2010-2025 NFL DATA
                                </strong>

                                <p>
                                    Historical player-seasons, weekly statistics, schedules, opponents, bye weeks, and Full-PPR scoring are transformed into playable game data.
                                </p>
                            </article>

                            <article>
                                <strong>
                                    LINEUP SEARCH
                                </strong>

                                <p>
                                    Recursive constrained-search logic validates player-to-week assignments and optimizes legal lineups while respecting Blind Week information rules.
                                </p>
                            </article>

                            <article>
                                <strong>
                                    ADAPTIVE CPU
                                </strong>

                                <p>
                                    Opponent generation evaluates historical performance, playable weeks, season value, rarity, and round-specific difficulty to scale through nine rounds.
                                </p>
                            </article>

                            <article>
                                <strong>
                                    REACT GAME STATE
                                </strong>

                                <p>
                                    Drafting, perks, trades, Bench swaps, Blind Weeks, Film Study, Second Wind, result sequencing, and Hall of Fame history are coordinated in React.
                                </p>
                            </article>
                        </div>
                    </section>

                    <div className="about-links">
                        {GITHUB_URL && (
                            <a
                                href={
                                    GITHUB_URL
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                referrerPolicy="no-referrer"
                            >
                                GITHUB ↗
                            </a>
                        )}
                    </div>

                </main>
            </div>
        );
    }


    /* =====================================================
       PRIVACY POLICY
       ===================================================== */

    if (
        !locked &&
        menuPage ===
        "PRIVACY"
    ) {
        return (
            <LegalPage
                eyebrow="LEGAL"
                title="PRIVACY POLICY"
                effectiveDate={
                    LEGAL_EFFECTIVE_DATE
                }
                intro="How Gridiron Gauntlet handles browser storage, external content, and technical data."
                sections={
                    PRIVACY_POLICY_SECTIONS
                }
                onBack={() =>
                    setMenuPage(
                        "HOME"
                    )
                }
            />
        );
    }


    /* =====================================================
       TERMS OF SERVICE
       ===================================================== */

    if (
        !locked &&
        menuPage ===
        "TERMS"
    ) {
        return (
            <LegalPage
                eyebrow="LEGAL"
                title="TERMS OF SERVICE"
                effectiveDate={
                    LEGAL_EFFECTIVE_DATE
                }
                intro="Rules and conditions for using Gridiron Gauntlet."
                sections={
                    TERMS_SECTIONS
                }
                onBack={() =>
                    setMenuPage(
                        "HOME"
                    )
                }
            />
        );
    }


    /* =====================================================
       DISCLAIMER
       ===================================================== */

    if (
        !locked &&
        menuPage ===
        "DISCLAIMER"
    ) {
        return (
            <LegalPage
                eyebrow="LEGAL"
                title="SPORTS & LIABILITY DISCLAIMER"
                effectiveDate={
                    LEGAL_EFFECTIVE_DATE
                }
                intro="Important information about historical sports data, third-party property, and game results."
                sections={
                    DISCLAIMER_SECTIONS
                }
                onBack={() =>
                    setMenuPage(
                        "HOME"
                    )
                }
            />
        );
    }


    /* =====================================================
       OPEN-SOURCE LICENSES
       ===================================================== */

    if (
        !locked &&
        menuPage ===
        "LICENSES"
    ) {
        return (
            <LegalPage
                eyebrow="PROJECT NOTICES"
                title="OPEN-SOURCE LICENSES"
                intro="Open-source software used to build and run Gridiron Gauntlet."
                sections={
                    THIRD_PARTY_SECTIONS
                }
                noticeHref={`${import.meta.env.BASE_URL}third-party-licenses.txt`}
                noticeLabel="VIEW FULL THIRD-PARTY NOTICES"
                onBack={() =>
                    setMenuPage(
                        "HOME"
                    )
                }
            />
        );
    }


    /* =====================================================
       HALL OF FAME PAGE
       ===================================================== */

    if (
        !locked &&
        menuPage ===
        "HALL_OF_FAME"
    ) {
        return (
            <div className="App info-page hall-of-fame-menu-page">
                <header className="info-topbar">
                    <button
                        className="info-back-button"
                        onClick={() =>
                            setMenuPage(
                                "HOME"
                            )
                        }
                    >
                        ← MAIN MENU
                    </button>

                    <div className="info-brand">
                        GG
                    </div>
                </header>

                <main className="info-screen hall-of-fame-menu-screen">
                    <div className="info-heading">
                        <span>
                            SAVED RUNS
                        </span>

                        <h1>
                            HALL OF FAME
                        </h1>

                        <p>
                            Your completed and eliminated Gridiron Gauntlet runs. Saved only in this browser.
                        </p>
                    </div>

                    <div className="hall-of-fame-menu-content">
                        <HallOfFame
                            runs={
                                hallOfFame
                            }
                            onClear={
                                clearHallOfFame
                            }
                        />
                    </div>

                    <button
                        className="info-primary-button"
                        onClick={() =>
                            setMenuPage(
                                "DRAFT"
                            )
                        }
                    >
                        START A RUN
                    </button>
                </main>
            </div>
        );
    }


    /* =====================================================
       DRAFT PAGE
       ===================================================== */

    if (
        !locked &&
        menuPage ===
        "DRAFT"
    ) {
        return (
            <div className="App draft-page">
                <header className="draft-topbar">
                    <div className="draft-brand">
                        GG
                    </div>
                </header>

                <main className="draft-screen">
                    <div className="draft-heading">
                        <h2>
                            DRAFT YOUR{" "}
                            <span>
                                SQUAD
                            </span>
                        </h2>

                        <div className="draft-progress">
                            <div className="draft-diamonds">
                                {Array.from({
                                    length:
                                        7,
                                }).map(
                                    (
                                        _,
                                        index
                                    ) => (
                                        <span
                                            key={
                                                index
                                            }
                                            className={
                                                index <
                                                    selectedDraftPlayers.length
                                                    ? "draft-diamond active"
                                                    : "draft-diamond"
                                            }
                                        >
                                            ◆
                                        </span>
                                    )
                                )}
                            </div>

                            <strong>
                                {
                                    selectedDraftPlayers.length
                                } / 7
                            </strong>

                            <span>
                                selected
                            </span>
                        </div>
                    </div>

                    <div className="draft-board">
                        {DRAFT_POSITIONS.map(
                            (
                                position
                            ) => (
                                <div
                                    className="draft-position-column"
                                    key={
                                        position
                                    }
                                >
                                    <h3 className="draft-position-title">
                                        {
                                            position
                                        }
                                    </h3>

                                    <div className="draft-position-cards">
                                        {draftOptions[
                                            position
                                        ].map(
                                            (
                                                player
                                            ) => (
                                                <PlayerCard
                                                    key={
                                                        getPlayerId(
                                                            player
                                                        )
                                                    }
                                                    player={
                                                        player
                                                    }
                                                    variant="draft"
                                                    selected={
                                                        isPlayerSelected(
                                                            player
                                                        )
                                                    }
                                                    onClick={
                                                        draftConfirmed
                                                            ? null
                                                            : () =>
                                                                toggleDraftPlayer(
                                                                    player
                                                                )
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    <div className="draft-actions">
                        {!draftConfirmed ? (
                            <div className="draft-confirmed-actions">
                                <button
                                    className="draft-edit-button"
                                    onClick={
                                        autoDraft
                                    }
                                >
                                    🎲 AUTO DRAFT
                                </button>

                                <button
                                    className="draft-lock-button"
                                    disabled={
                                        !draftIsValid
                                    }
                                    onClick={
                                        lockInDraft
                                    }
                                >
                                    LOCK IN
                                </button>
                            </div>
                        ) : (
                            <div className="draft-confirmed-actions">
                                <button
                                    className="draft-edit-button"
                                    onClick={
                                        editDraft
                                    }
                                >
                                    EDIT PICKS
                                </button>

                                <button
                                    className="draft-start-button"
                                    onClick={
                                        startGauntlet
                                    }
                                >
                                    START GAUNTLET
                                </button>
                            </div>
                        )}
                    </div>

                    {selectedDraftPlayers.length ===
                        7 &&
                        !draftIsValid &&
                        !draftConfirmed && (
                            <div className="draft-warning">
                                Your starting roster must contain{" "}
                                <strong>
                                    QB • RB • RB • WR • WR • TE • FLEX
                                </strong>
                            </div>
                        )}
                </main>
            </div>
        );
    }


    /* =====================================================
       PERK PAGE
       ===================================================== */

    if (
        perkPhase
    ) {
        const legalReplacementPlayers =
            perkIncoming
                ? getLegalReplacementTargets(
                    rosterSlots,
                    perkIncoming
                )
                : [];

        return (
            <div className="App gauntlet-page perk-page">
                <header className="topBar">
                    <div className="topBarInner">
                        <div className="brand">
                            <div className="logo">
                                GG
                            </div>

                            <h2>
                                Gridiron Gauntlet
                            </h2>
                        </div>

                        <div className="controls">
                            <div className="round-header-record">
                                ROUND {round} WON
                            </div>

                            <div>
                                {wins} WINS
                            </div>

                            <div className="round-header-perks">
                                {ownedPerks.length} PERKS
                            </div>
                        </div>
                    </div>
                </header>

                <main className="perk-screen">
                    <div className="perk-screen-heading">
                        <span className="perk-reward-kicker">
                            VICTORY REWARD
                        </span>

                        <h1>
                            {activePerk
                                ? (
                                    activePerk.label ||
                                    activePerk.name
                                )
                                : perkPicksRemaining >
                                    1
                                    ? "CHOOSE 2 PERKS"
                                    : "CHOOSE YOUR PERK"}
                        </h1>

                        <p>
                            {activePerk
                                ? activePerk.id ===
                                    "FILM_STUDY"
                                    ? "Permanently reveal two random non-Blind CPU placements, including exact fantasy points, at the start of every remaining round."
                                    : activePerk.description
                                : perkPicksRemaining >
                                    1
                                    ? "Blackout reward: choose two different perks before entering the next round."
                                    : "Choose one reward before entering the next round."}
                        </p>
                    </div>


                    {/* =============================================
                        PERK SELECTION
                       ============================================= */}

                    {!activePerk && (
                        <>
                            <div className="perk-reward-grid">
                                {perkChoices.map(
                                    (
                                        perk
                                    ) => (
                                        <PerkCard
                                            key={
                                                perk.id
                                            }
                                            perk={
                                                perk.id ===
                                                    "FILM_STUDY"
                                                    ? {
                                                        ...perk,
                                                        description:
                                                            "Permanently reveal two random non-Blind CPU placements, including exact fantasy points, at the start of every remaining round.",
                                                    }
                                                    : perk
                                            }
                                            onClick={() =>
                                                choosePerk(
                                                    perk
                                                )
                                            }
                                        />
                                    )
                                )}
                            </div>

                            <button
                                className="perk-back-button"
                                onClick={
                                    skipPerk
                                }
                            >
                                SKIP PERK
                            </button>
                        </>
                    )}


                    {/* =============================================
                        TEAMMATES
                       ============================================= */}

                    {activePerk?.id ===
                        "TEAMMATES" &&
                        !perkTarget && (
                            <>
                                <div className="perk-section-heading">
                                    <h3>
                                        CHOOSE A PLAYER
                                    </h3>

                                    <p>
                                        Pick one roster player to search for teammates from the same team and season.
                                    </p>
                                </div>

                                <div className="perk-player-grid">
                                    {rosterSlots.map(
                                        (
                                            player,
                                            index
                                        ) => (
                                            <PlayerCard
                                                key={`${getPlayerId(
                                                    player
                                                )}-${index}`}
                                                player={
                                                    player
                                                }
                                                variant="draft"
                                                onClick={() =>
                                                    chooseTeammatesTarget(
                                                        player
                                                    )
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            </>
                        )}


                    {activePerk?.id ===
                        "TEAMMATES" &&
                        perkTarget && (
                            <>
                                <div className="perk-trade-current">
                                    <PlayerCard
                                        player={
                                            perkTarget
                                        }
                                        variant="draft"
                                    />

                                    <strong>
                                        🤝
                                    </strong>

                                    <p>
                                        AVAILABLE TEAMMATES
                                    </p>
                                </div>

                                <div className="perk-player-grid">
                                    {perkPlayerChoices.map(
                                        (
                                            player,
                                            index
                                        ) => (
                                            <PlayerCard
                                                key={`${getPlayerId(
                                                    player
                                                )}-${index}`}
                                                player={
                                                    player
                                                }
                                                variant="draft"
                                                onClick={() =>
                                                    completeTeammatesTrade(
                                                        player
                                                    )
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            </>
                        )}


                    {/* =============================================
                        TIME TRAVEL
                       ============================================= */}

                    {activePerk?.id ===
                        "TIME_TRAVEL" &&
                        !perkTarget && (
                            <>
                                <div className="perk-section-heading">
                                    <h3>
                                        CHOOSE WHO TO TIME TRAVEL
                                    </h3>

                                    <p>
                                        Select a player to see every available historical season.
                                    </p>
                                </div>

                                <div className="perk-player-grid">
                                    {rosterSlots.map(
                                        (
                                            player,
                                            index
                                        ) => (
                                            <PlayerCard
                                                key={`${getPlayerId(
                                                    player
                                                )}-${index}`}
                                                player={
                                                    player
                                                }
                                                variant="draft"
                                                onClick={() =>
                                                    chooseTimeTravelTarget(
                                                        player
                                                    )
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            </>
                        )}


                    {activePerk?.id ===
                        "TIME_TRAVEL" &&
                        perkTarget && (
                            <>
                                <div className="perk-trade-current">
                                    <span>
                                        CURRENT VERSION
                                    </span>

                                    <PlayerCard
                                        player={
                                            perkTarget
                                        }
                                        variant="draft"
                                    />

                                    <strong>
                                        ⏪
                                    </strong>

                                    <p>
                                        AVAILABLE SEASONS
                                    </p>
                                </div>

                                <div className="perk-player-grid">
                                    {perkPlayerChoices.map(
                                        (
                                            player,
                                            index
                                        ) => (
                                            <PlayerCard
                                                key={`${getPlayerId(
                                                    player
                                                )}-${index}`}
                                                player={
                                                    player
                                                }
                                                variant="draft"
                                                onClick={() =>
                                                    completeTimeTravel(
                                                        player
                                                    )
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            </>
                        )}


                    {/* =============================================
                        LEGENDARY: DIVISION RIVAL
                       ============================================= */}

                    {activePerk?.id ===
                        "DIVISION_RIVAL" &&
                        !perkTarget && (
                            <>
                                <div
                                    className="perk-section-heading"
                                    style={{
                                        textAlign:
                                            "center",
                                    }}
                                >
                                    <div
                                        style={{
                                            color:
                                                "#f5c542",

                                            fontWeight:
                                                900,

                                            letterSpacing:
                                                "0.16em",

                                            marginBottom:
                                                "10px",
                                        }}
                                    >
                                        ★ LEGENDARY PERK ★
                                    </div>

                                    <h3>
                                        CHOOSE THE PLAYER YOU WILL RISK
                                    </h3>

                                    <p>
                                        Once selected, this player is locked into Division Rival. The slot will roll one of that player's three division rivals from the same season.
                                    </p>
                                </div>

                                <div className="perk-player-grid">
                                    {rosterSlots
                                        .filter(
                                            Boolean
                                        )
                                        .map(
                                            (
                                                player,
                                                index
                                            ) => (
                                                <PlayerCard
                                                    key={`${getPlayerId(
                                                        player
                                                    )}-${index}`}
                                                    player={
                                                        player
                                                    }
                                                    variant="draft"
                                                    onClick={() =>
                                                        chooseDivisionRivalTarget(
                                                            player
                                                        )
                                                    }
                                                />
                                            )
                                        )}
                                </div>
                            </>
                        )}


                    {activePerk?.id ===
                        "DIVISION_RIVAL" &&
                        perkTarget && (
                            <>
                                <div
                                    className="perk-trade-current"
                                    style={{
                                        border:
                                            "2px solid rgba(245, 197, 66, 0.7)",

                                        background:
                                            "linear-gradient(135deg, rgba(245,197,66,0.10), rgba(255,255,255,0.02))",
                                    }}
                                >
                                    <span
                                        style={{
                                            color:
                                                "#f5c542",

                                            fontWeight:
                                                900,

                                            letterSpacing:
                                                "0.14em",
                                        }}
                                    >
                                        🔒 PLAYER LOCKED
                                    </span>

                                    <PlayerCard
                                        player={
                                            perkTarget
                                        }
                                        variant="draft"
                                    />

                                    <strong>
                                        ⚔️
                                    </strong>

                                    <p>
                                        THIS PLAYER MUST BE REPLACED
                                    </p>
                                </div>

                                <div
                                    style={{
                                        maxWidth:
                                            "420px",

                                        margin:
                                            "26px auto",

                                        padding:
                                            "22px",

                                        borderRadius:
                                            "20px",

                                        border:
                                            "3px solid rgba(245, 197, 66, 0.75)",

                                        background:
                                            "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(0,0,0,0.22))",

                                        textAlign:
                                            "center",

                                        boxShadow:
                                            divisionRivalSpinning
                                                ? "0 0 34px rgba(245,197,66,0.20)"
                                                : "0 0 24px rgba(245,197,66,0.12)",

                                        transition:
                                            "box-shadow 180ms ease, transform 180ms ease",
                                    }}
                                >
                                    <div
                                        style={{
                                            color:
                                                "#f5c542",

                                            fontWeight:
                                                900,

                                            letterSpacing:
                                                "0.16em",

                                            marginBottom:
                                                "14px",
                                        }}
                                    >
                                        🎰 DIVISION RIVAL SLOT
                                    </div>

                                    <div
                                        style={{
                                            minHeight:
                                                "120px",

                                            display:
                                                "flex",

                                            alignItems:
                                                "center",

                                            justifyContent:
                                                "center",

                                            gap:
                                                "22px",

                                            overflow:
                                                "hidden",
                                        }}
                                    >
                                        {divisionRivalDisplayTeam &&
                                            (
                                                TEAM_LOGOS?.[
                                                divisionRivalDisplayTeam
                                                ] ||
                                                TEAM_LOGOS?.[
                                                normalizeNFLFranchise(
                                                    divisionRivalDisplayTeam
                                                )
                                                ]
                                            ) && (
                                                <img
                                                    key={`division-rival-logo-${divisionRivalDisplayTeam}`}
                                                    referrerPolicy="no-referrer"
                                                    loading="lazy"
                                                    decoding="async"
                                                    src={
                                                        TEAM_LOGOS?.[
                                                        divisionRivalDisplayTeam
                                                        ] ||
                                                        TEAM_LOGOS?.[
                                                        normalizeNFLFranchise(
                                                            divisionRivalDisplayTeam
                                                        )
                                                        ]
                                                    }
                                                    alt={`${divisionRivalDisplayTeam} logo`}
                                                    style={{
                                                        width:
                                                            "82px",

                                                        height:
                                                            "82px",

                                                        objectFit:
                                                            "contain",
                                                    }}
                                                />
                                            )}

                                        <strong
                                            key={`division-rival-name-${divisionRivalDisplayTeam || "ready"}`}
                                            style={{
                                                fontSize:
                                                    "2.35rem",

                                                letterSpacing:
                                                    "0.08em",
                                            }}
                                        >
                                            {divisionRivalDisplayTeam ||
                                                "READY"}
                                        </strong>
                                    </div>

                                    <div
                                        style={{
                                            marginTop:
                                                "12px",

                                            fontWeight:
                                                900,

                                            letterSpacing:
                                                "0.12em",

                                            color:
                                                divisionRivalSpinning
                                                    ? undefined
                                                    : "#f5c542",
                                        }}
                                    >
                                        {divisionRivalSpinning
                                            ? "ROLLING THROUGH DIVISION RIVALS..."
                                            : "RIVAL LOCKED"}
                                    </div>
                                </div>

                                {!divisionRivalSpinning &&
                                    perkPlayerChoices.length >
                                    0 && (
                                        <>
                                            <div className="perk-section-heading">
                                                <h3>
                                                    CHOOSE YOUR RIVAL PLAYER
                                                </h3>

                                                <p>
                                                    Choose any legal {divisionRivalDisplayTeam} player from {getPlayerSeason(
                                                        perkTarget
                                                    )}. They will replace {perkTarget.name}.
                                                </p>
                                            </div>

                                            <div className="perk-player-grid">
                                                {perkPlayerChoices.map(
                                                    (
                                                        player,
                                                        index
                                                    ) => (
                                                        <PlayerCard
                                                            key={`${getPlayerId(
                                                                player
                                                            )}-${index}`}
                                                            player={
                                                                player
                                                            }
                                                            variant="draft"
                                                            onClick={() =>
                                                                completeDivisionRivalTrade(
                                                                    player
                                                                )
                                                            }
                                                        />
                                                    )
                                                )}
                                            </div>
                                        </>
                                    )}
                            </>
                        )}


                    {/* =============================================
                        BOOSTER PACK / TRADING
                       ============================================= */}

                    {activePerk &&
                        (
                            activePerk.id ===
                            "BOOSTER_PACK" ||
                            activePerk.id ===
                            "TRADING"
                        ) &&
                        !perkIncoming && (
                            <>
                                <div className="perk-section-heading">
                                    <h3>
                                        {activePerk.id ===
                                            "BOOSTER_PACK"
                                            ? "CHOOSE ONE PLAYER"
                                            : "CHOOSE AN OPPONENT PLAYER"}
                                    </h3>

                                    {activePerk.id ===
                                        "BOOSTER_PACK" &&
                                        benchUnlocked &&
                                        !benchPlayer && (
                                            <p>
                                                Your Bench is empty. The player you choose will fill it without dropping an active player.
                                            </p>
                                        )}
                                </div>

                                <div className="perk-player-grid">
                                    {perkPlayerChoices.map(
                                        (
                                            player,
                                            index
                                        ) => (
                                            <PlayerCard
                                                key={`${getPlayerId(
                                                    player
                                                )}-${index}`}
                                                player={
                                                    player
                                                }
                                                variant="draft"
                                                onClick={() =>
                                                    chooseIncomingPlayer(
                                                        player
                                                    )
                                                }
                                            />
                                        )
                                    )}
                                </div>
                            </>
                        )}


                    {/* =============================================
                        CHOOSE REPLACEMENT
                       ============================================= */}

                    {perkIncoming && (
                        <>
                            <div className="perk-section-heading">
                                <h3>
                                    CHOOSE WHO TO TRADE AWAY
                                </h3>
                            </div>

                            <div className="perk-player-grid">
                                {legalReplacementPlayers.map(
                                    (
                                        player,
                                        index
                                    ) => (
                                        <PlayerCard
                                            key={`${getPlayerId(
                                                player
                                            )}-${index}`}
                                            player={
                                                player
                                            }
                                            variant="draft"
                                            onClick={() =>
                                                completeIncomingTrade(
                                                    player
                                                )
                                            }
                                        />
                                    )
                                )}
                            </div>
                        </>
                    )}


                    {/* =============================================
                        BENCH
                       ============================================= */}

                    {activePerk?.id ===
                        "BENCH" && (
                            <>
                                <div className="perk-section-heading">
                                    <h3>
                                        UNLOCK A PERMANENT BENCH?
                                    </h3>

                                    <p>
                                        Carry one extra reserve player for the rest of this run.
                                    </p>
                                </div>

                                <button
                                    className="draft-start-button"
                                    onClick={
                                        activateBenchPerk
                                    }
                                >
                                    🪑 UNLOCK BENCH
                                </button>
                            </>
                        )}


                    {/* =============================================
                        TRADE MARKET
                       ============================================= */}

                    {activePerk?.id ===
                        "TRADE_MARKET" && (
                            <>
                                <div className="perk-section-heading">
                                    <h3>
                                        CHOOSE ONE TRADE OFFER
                                    </h3>

                                    <p>
                                        Offers can be strong, fair, or traps. Choose carefully.
                                    </p>
                                </div>

                                {tradeMarketOffers.map(
                                    (
                                        offer,
                                        offerIndex
                                    ) => (
                                        <div
                                            className="perk-trade-current"
                                            key={
                                                offerIndex
                                            }
                                        >
                                            <span>
                                                OFFER {offerIndex + 1}
                                            </span>

                                            <p>
                                                YOU GIVE
                                            </p>

                                            <div className="perk-player-grid">
                                                {offer.give.map(
                                                    (
                                                        player,
                                                        index
                                                    ) => (
                                                        <PlayerCard
                                                            key={`give-${offerIndex}-${getPlayerId(
                                                                player
                                                            )}-${index}`}
                                                            player={
                                                                player
                                                            }
                                                            variant="draft"
                                                        />
                                                    )
                                                )}
                                            </div>

                                            <strong>
                                                ⇅
                                            </strong>

                                            <p>
                                                YOU RECEIVE
                                            </p>

                                            <div className="perk-player-grid">
                                                {offer.receive.map(
                                                    (
                                                        player,
                                                        index
                                                    ) => (
                                                        <PlayerCard
                                                            key={`receive-${offerIndex}-${getPlayerId(
                                                                player
                                                            )}-${index}`}
                                                            player={
                                                                player
                                                            }
                                                            variant="draft"
                                                        />
                                                    )
                                                )}
                                            </div>

                                            {offer.consumesBench && (
                                                <p>
                                                    THIS DEAL USES YOUR BENCH PLAYER
                                                </p>
                                            )}

                                            <button
                                                className="draft-start-button"
                                                onClick={() =>
                                                    acceptTradeMarketOffer(
                                                        offer
                                                    )
                                                }
                                            >
                                                ACCEPT OFFER
                                            </button>
                                        </div>
                                    )
                                )}

                                {tradeMarketOffers.length ===
                                    0 && (
                                        <p>
                                            No legal Trade Market offers could be generated for this roster.
                                        </p>
                                    )}
                            </>
                        )}


                    {/* =============================================
                        SECOND WIND
                       ============================================= */}

                    {activePerk?.id ===
                        "SECOND_WIND" && (
                            <>
                                <div className="perk-section-heading">
                                    <h3>
                                        GAIN ONE EXTRA LIFE
                                    </h3>

                                    <p>
                                        If you lose, replay the same round number against a completely new opponent.
                                    </p>
                                </div>

                                <button
                                    className="draft-start-button"
                                    onClick={
                                        activateSecondWind
                                    }
                                >
                                    ♻️ TAKE SECOND WIND
                                </button>
                            </>
                        )}


                    {/* =============================================
                        PERK NAVIGATION

                        A perk can be inspected and backed out of
                        until it is actually used / confirmed.
                       ============================================= */}

                    {activePerk && (
                        <div className="perk-bottom-actions">
                            <button
                                className="perk-back-button"
                                onClick={
                                    chooseAnotherPerk
                                }
                            >
                                ← BACK TO PERKS
                            </button>

                            <button
                                className="perk-back-button"
                                onClick={
                                    skipPerk
                                }
                            >
                                SKIP PERK
                            </button>
                        </div>
                    )}
                </main>
            </div>
        );
    }


    /* =====================================================
       ROUND PAGE
       ===================================================== */

    return (
        <div
            className={[
                "App",
                "gauntlet-page",
                "round-stage",
                round > MAX_ROUNDS
                    ? "round-stage-endless"
                    : round >= 9
                        ? `round-stage-${round}`
                        : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <MemoizedRoundArenaAtmosphere
                round={round}
            />

            <div className="gg-round-content">
                <header className="topBar">
                    <div className="topBarInner">
                        <div className="brand">
                            <div className="logo">
                                GG
                            </div>

                            <h2>
                                Gridiron Gauntlet
                            </h2>
                        </div>

                        <div className="controls">
                            <div className="round-header-record">
                                {endlessMode
                                    ? `🔥 ENDLESS ${round}`
                                    : `ROUND ${round}`}
                            </div>

                            <div>
                                {wins} WINS
                            </div>

                            <div className="round-header-perks">
                                {ownedPerks.length} PERKS
                            </div>
                        </div>
                    </div>
                </header>


                <section className="round-hero">
                    <div className="round-kicker">
                        {bestBallActive
                            ? `🏆 BEST BALL • ROUND ${round}`
                            : round > MAX_ROUNDS
                                ? `ENDLESS GAUNTLET • ROUND ${round}`
                                : round === 12
                                    ? "CHAMPIONSHIP • ROUND 12"
                                    : round === 11
                                        ? "FINAL FOUR • ROUND 11"
                                        : round === 10
                                            ? "PLAYOFFS • ROUND 10"
                                            : `ROUND ${round}`}
                    </div>

                    <h1>
                        {bestBallActive
                            ? "TOTAL POINTS SHOWDOWN"
                            : round > MAX_ROUNDS
                                ? round >= 25
                                    ? "LEGENDARY RUN"
                                    : round >= 20
                                        ? "DEEP IN THE GAUNTLET"
                                        : "HOW FAR CAN YOU GO?"
                                : round === 12
                                    ? "CHAMPIONSHIP SHOWDOWN"
                                    : round === 11
                                        ? "ONE WIN FROM THE FINAL"
                                        : round === 10
                                            ? "SURVIVE THE PLAYOFFS"
                                            : "SET YOUR LINEUP"}
                    </h1>

                    <p>
                        {bestBallActive
                            ? "Best Ball is active. Forget the 4-of-7 battle count. Add all seven fantasy scores together. Highest total FP wins this round."
                            : round > MAX_ROUNDS
                                ? "The championship is already yours. Every win now pushes your Endless record farther while the opponent pool keeps getting stronger."
                                : round === 12
                                    ? "This is it. Seven battles decide whether you conquer the Gauntlet."
                                    : round === 11
                                        ? "The championship is one win away. Every historical week matters now."
                                        : round === 10
                                            ? "The playoff push begins. Set your lineup and survive the pressure."
                                            : "Select a player to compare their Full-PPR scores across every available week."}
                    </p>

                    <div className="round-category-score">
                        <span>
                            YOU
                        </span>

                        <strong>
                            {bestBallActive
                                ? roundResult
                                    ? `${roundResult.userTotal.toFixed(1)} FP`
                                    : "-- FP"
                                : roundResult
                                    ?.userCategoryWins ??
                                0}
                        </strong>

                        <span className="round-category-score-vs">
                            VS
                        </span>

                        <strong>
                            {bestBallActive
                                ? roundResult
                                    ? `${roundResult.cpuTotal.toFixed(1)} FP`
                                    : "-- FP"
                                : roundResult
                                    ?.cpuCategoryWins ??
                                0}
                        </strong>

                        <span>
                            CPU
                        </span>
                    </div>
                </section>


                <main className="round-layout">
                    {/* =================================================
                    YOUR PLAYERS
                   ================================================= */}

                    <aside className="round-roster-panel">
                        <div className="round-panel-heading">
                            <span>
                                YOUR PLAYERS
                            </span>

                            <small>
                                {
                                    roundSlots.filter(
                                        (
                                            slot
                                        ) =>
                                            slot.assigned
                                    ).length
                                } / 7 placed
                            </small>
                        </div>

                        <div className="round-roster-cards">
                            {rosterSlots.map(
                                (
                                    player,
                                    index
                                ) => {
                                    if (
                                        !player
                                    ) {
                                        return null;
                                    }

                                    const alreadyPlaced =
                                        roundSlots.some(
                                            (
                                                slot
                                            ) =>
                                                slot.assignedIndex ===
                                                index
                                        );

                                    const selected =
                                        placing
                                            ?.rosterIndex ===
                                        index;

                                    return (
                                        <div
                                            key={`${getPlayerId(
                                                player
                                            )}-${index}`}
                                            className={[
                                                "round-roster-card-wrap",
                                                alreadyPlaced
                                                    ? "round-roster-card-used"
                                                    : "",
                                            ]
                                                .filter(
                                                    Boolean
                                                )
                                                .join(
                                                    " "
                                                )}
                                        >
                                            <div className="round-roster-position">
                                                {
                                                    getPlayerPosition(
                                                        player
                                                    )
                                                }
                                            </div>

                                            <PlayerCard
                                                player={
                                                    player
                                                }
                                                variant="draft"
                                                selected={
                                                    selected
                                                }
                                                onClick={
                                                    alreadyPlaced ||
                                                        roundResolved
                                                        ? null
                                                        : benchSwapMode
                                                            ? () =>
                                                                swapBenchWithActive(
                                                                    index
                                                                )
                                                            : () =>
                                                                selectRosterPlayer(
                                                                    player,
                                                                    index
                                                                )
                                                }
                                            />

                                            {alreadyPlaced && (
                                                <div className="round-player-used">
                                                    PLACED
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                            )}

                            {benchUnlocked && (
                                <div className="round-roster-card-wrap">
                                    <div className="round-roster-position">
                                        BENCH
                                    </div>

                                    {benchPlayer ? (
                                        <>
                                            <PlayerCard
                                                player={
                                                    benchPlayer
                                                }
                                                variant="draft"
                                                selected={
                                                    benchSwapMode
                                                }
                                                onClick={
                                                    !roundResolved &&
                                                        !roundSlots.some(
                                                            (
                                                                slot
                                                            ) =>
                                                                slot.assigned
                                                        )
                                                        ? () =>
                                                            setBenchSwapMode(
                                                                (
                                                                    current
                                                                ) =>
                                                                    !current
                                                            )
                                                        : null
                                                }
                                            />

                                            {benchSwapMode && (
                                                <div className="round-player-used">
                                                    SELECT ACTIVE PLAYER
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="round-player-used">
                                            EMPTY BENCH
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </aside>


                    {/* =================================================
                    WEEK BATTLES
                   ================================================= */}

                    <section className="round-board">
                        <div className="round-board-heading">
                            <div>
                                <h2>
                                    {bestBallActive
                                        ? "BEST BALL LINEUP"
                                        : "WEEK BATTLES"}
                                </h2>

                                <p>
                                    {placing?.player
                                        ? bestBallActive
                                            ? `${placing.player.name} selected. Place them where they add the most to your 7-player total.`
                                            : `${placing.player.name} selected. Compare their scores and choose a week.`
                                        : bestBallActive
                                            ? "Build the highest-scoring legal lineup. Individual week wins do not decide this round."
                                            : "Choose a player or use Auto Lineup."}
                                </p>

                                {bestBallActive && (
                                    <p>
                                        🏆 BEST BALL ACTIVE: HIGHEST TOTAL FANTASY POINTS WINS.
                                    </p>
                                )}

                                {perfectVisionRoundActive && (
                                    <p>
                                        👁️ PERFECT VISION ACTIVE: all Mystery Weeks are revealed.
                                    </p>
                                )}

                                {blackoutRoundActive && (
                                    <p>
                                        🌑 BLACKOUT ACTIVE: all 7 weeks are hidden. Win for 2 perk picks.
                                    </p>
                                )}
                            </div>

                            {!roundResolved && (
                                <div className="round-lineup-actions">
                                    {weekScramblerAcquired &&
                                        weekScramblerUsesRemaining >
                                        0 &&
                                        !roundSlots.some(
                                            (
                                                slot
                                            ) =>
                                                Boolean(
                                                    slot.assigned
                                                )
                                        ) && (
                                            <button
                                                className="round-auto-lineup-button round-lock-lineup-button"
                                                onClick={
                                                    useWeekScrambler
                                                }
                                            >
                                                🌀 SCRAMBLE WEEKS ({weekScramblerUsesRemaining})
                                            </button>
                                        )}

                                    <button
                                        className="round-auto-lineup-button round-lock-lineup-button"
                                        onClick={
                                            autoLineup
                                        }
                                    >
                                        ⚡ AUTO LINEUP
                                    </button>

                                    <button
                                        className="round-clear-lineup-button"
                                        disabled={
                                            !roundSlots.some(
                                                (
                                                    slot
                                                ) =>
                                                    slot.assigned
                                            )
                                        }
                                        onClick={
                                            clearLineup
                                        }
                                    >
                                        CLEAR
                                    </button>

                                    <button
                                        className="round-lock-lineup-button"
                                        disabled={
                                            !lineupComplete
                                        }
                                        onClick={
                                            resolveRound
                                        }
                                    >
                                        LOCK LINEUP
                                    </button>
                                </div>
                            )}
                        </div>


                        <div className="round-week-grid">
                            {roundSlots.map(
                                (
                                    slot,
                                    index
                                ) => {
                                    const previewWeekData =
                                        placing?.player
                                            ? getWeekData(
                                                placing.player,
                                                slot.week
                                            )
                                            : null;

                                    const previewOpponent =
                                        slot.isBlind &&
                                            !roundResolved
                                            ? null
                                            : (
                                                previewWeekData
                                                    ?.opponent ||
                                                null
                                            );

                                    const previewFantasyPoints =
                                        slot.isBlind &&
                                            !roundResolved
                                            ? null
                                            : (
                                                previewWeekData
                                                    ? getUserWeekFantasyPoints(
                                                        placing.player,
                                                        slot.week,
                                                        tePremiumActive
                                                    )
                                                    : null
                                            );

                                    const previewLogo =
                                        previewOpponent
                                            ? (
                                                TEAM_LOGOS?.[
                                                previewOpponent
                                                ] ||
                                                null
                                            )
                                            : null;


                                    const assignedWeekData =
                                        slot.assigned
                                            ? getWeekData(
                                                slot.assigned,
                                                slot.week
                                            )
                                            : null;

                                    const assignedOpponent =
                                        slot.isBlind &&
                                            !roundResolved
                                            ? null
                                            : (
                                                assignedWeekData
                                                    ?.opponent ||
                                                null
                                            );

                                    const assignedFantasyPoints =
                                        slot.isBlind &&
                                            !roundResolved
                                            ? null
                                            : (
                                                assignedWeekData
                                                    ? getUserWeekFantasyPoints(
                                                        slot.assigned,
                                                        slot.week,
                                                        tePremiumActive
                                                    )
                                                    : null
                                            );

                                    const assignedOpponentLogo =
                                        assignedOpponent
                                            ? (
                                                TEAM_LOGOS?.[
                                                assignedOpponent
                                                ] ||
                                                null
                                            )
                                            : null;


                                    const result =
                                        categoryResults.find(
                                            (
                                                item
                                            ) =>
                                                Number(
                                                    item.week
                                                ) ===
                                                Number(
                                                    slot.week
                                                )
                                        );


                                    /* =========================================
                                       FILM STUDY
    
                                       Match the revealed CPU assignment directly
                                       to this visible week row so the perk is
                                       obvious on the battle board.
    
                                       Blind Weeks are never revealed.
                                       ========================================= */

                                    const filmStudyRevealForWeek =
                                        !roundResolved &&
                                            !slot.isBlind
                                            ? filmStudyReveals.find(
                                                (
                                                    reveal
                                                ) =>
                                                    Number(
                                                        reveal.week
                                                    ) ===
                                                    Number(
                                                        slot.week
                                                    )
                                            )
                                            : null;

                                    const filmStudyCpuPlayer =
                                        filmStudyRevealForWeek
                                            ? currentOpponent.find(
                                                (
                                                    player
                                                ) =>
                                                    getPlayerId(
                                                        player
                                                    ) ===
                                                    filmStudyRevealForWeek.playerId
                                            ) || null
                                            : null;


                                    const battleAccentPlayer =
                                        placing?.player ||
                                        slot.assigned ||
                                        result?.userPlayer ||
                                        null;

                                    const battleAccent =
                                        battleAccentPlayer
                                            ? getPlayerAccent(
                                                battleAccentPlayer
                                            )
                                            : "#ff6500";

                                    const blindUserWin =
                                        roundResolved &&
                                        slot.isBlind &&
                                        result?.winner ===
                                        "user" &&
                                        index <
                                        revealedResultsCount;


                                    return (
                                        <div
                                            key={
                                                slot.week
                                            }
                                            className={[
                                                "round-week-category",

                                                !roundResolved &&
                                                    !slot.assigned
                                                    ? "round-week-empty"
                                                    : "",

                                                !roundResolved &&
                                                    slot.assigned
                                                    ? "round-week-assigned"
                                                    : "",

                                                roundResolved
                                                    ? "round-week-resolved"
                                                    : "",

                                                slot.isBlind &&
                                                    !roundResolved
                                                    ? "round-week-blind"
                                                    : "",

                                                result?.winner ===
                                                    "user"
                                                    ? "category-user-won"
                                                    : "",

                                                blindUserWin
                                                    ? "category-blind-user-won"
                                                    : "",

                                                result?.winner ===
                                                    "cpu"
                                                    ? "category-cpu-won"
                                                    : "",

                                                result?.winner ===
                                                    "tie"
                                                    ? "category-tied"
                                                    : "",
                                            ]
                                                .filter(
                                                    Boolean
                                                )
                                                .join(
                                                    " "
                                                )}
                                            style={{
                                                "--battle-accent":
                                                    battleAccent,

                                                opacity:
                                                    !roundResolved ||
                                                        index <
                                                        revealedResultsCount
                                                        ? 1
                                                        : 0,

                                                transform:
                                                    !roundResolved ||
                                                        index <
                                                        revealedResultsCount
                                                        ? "translateY(0) scale(1)"
                                                        : "translateY(16px) scale(0.992)",

                                                filter:
                                                    !roundResolved ||
                                                        index <
                                                        revealedResultsCount
                                                        ? "blur(0)"
                                                        : "blur(3px)",

                                                transition:
                                                    roundResolved &&
                                                        index <
                                                        revealedResultsCount
                                                        ? "opacity 0.26s ease, transform 0.26s ease, filter 0.26s ease, background 0.26s ease, border-color 0.26s ease, box-shadow 0.26s ease"
                                                        : "none",

                                                background:
                                                    blindUserWin
                                                        ? "radial-gradient(circle at 50% 50%, rgba(117, 77, 210, 0.18), transparent 72%), linear-gradient(145deg, #171421, #101217)"
                                                        : undefined,

                                                borderColor:
                                                    blindUserWin
                                                        ? "rgba(164, 125, 255, 0.72)"
                                                        : undefined,

                                                boxShadow:
                                                    blindUserWin
                                                        ? "0 8px 24px rgba(0, 0, 0, 0.18), 0 0 22px rgba(117, 77, 210, 0.20), inset 0 0 0 1px rgba(185, 156, 255, 0.14)"
                                                        : undefined,

                                                pointerEvents:
                                                    roundResolved &&
                                                        index >=
                                                        revealedResultsCount
                                                        ? "none"
                                                        : "auto",
                                            }}
                                        >
                                            <div className="round-week-category-header">
                                                <div className="battle-week-title">
                                                    <span>
                                                        WEEK
                                                    </span>

                                                    <strong>
                                                        {
                                                            slot.isBlind &&
                                                                !roundResolved
                                                                ? "???"
                                                                : slot.week
                                                        }
                                                    </strong>

                                                    {slot.isBlind &&
                                                        !roundResolved && (
                                                            <small className="battle-blind-label">
                                                                BLIND
                                                            </small>
                                                        )}
                                                </div>

                                                {!roundResolved &&
                                                    slot.assigned && (
                                                        <button
                                                            className="battle-change-button"
                                                            onClick={() =>
                                                                unassignPlayer(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            CHANGE
                                                        </button>
                                                    )}
                                            </div>


                                            {filmStudyCpuPlayer &&
                                                !roundResolved &&
                                                !slot.isBlind && (
                                                    <div
                                                        className="round-battle-assigned"
                                                        style={{
                                                            borderBottom:
                                                                "1px solid rgba(255, 101, 0, 0.14)",

                                                            background:
                                                                "radial-gradient(circle at 75% 50%, rgba(255, 101, 0, 0.075), transparent 58%)",
                                                        }}
                                                    >
                                                        <div className="battle-assigned-player">
                                                            <div className="battle-player-copy">
                                                                <span className="battle-small-label">
                                                                    YOUR SLOT
                                                                </span>

                                                                <strong>
                                                                    SELECT PLAYER
                                                                </strong>

                                                                <span>
                                                                    CPU placement revealed by Film Study
                                                                </span>
                                                            </div>
                                                        </div>


                                                        <div className="battle-assigned-vs">
                                                            <span>
                                                                VS
                                                            </span>
                                                        </div>


                                                        <div className="battle-assigned-player">
                                                            <MemoizedBattlePlayerAvatar
                                                                player={
                                                                    filmStudyCpuPlayer
                                                                }
                                                            />

                                                            <div className="battle-player-copy">
                                                                <span className="battle-small-label">
                                                                    🎥 CPU PLACED
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        getPlayerName(
                                                                            filmStudyCpuPlayer
                                                                        )
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        getPlayerPosition(
                                                                            filmStudyCpuPlayer
                                                                        )
                                                                    }

                                                                    {" • "}

                                                                    {
                                                                        getPlayerSeason(
                                                                            filmStudyCpuPlayer
                                                                        )
                                                                    }

                                                                    {" • "}

                                                                    {
                                                                        getPlayerTeam(
                                                                            filmStudyCpuPlayer
                                                                        )
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>


                                                        <div className="battle-assigned-status">
                                                            <div className="battle-assigned-fantasy">
                                                                <strong>
                                                                    {Number(
                                                                        filmStudyRevealForWeek.fantasyPoints ??
                                                                        0
                                                                    ).toFixed(
                                                                        1
                                                                    )}
                                                                </strong>

                                                                <span>
                                                                    WEEK FP
                                                                </span>
                                                            </div>

                                                            <small>
                                                                REVEALED
                                                            </small>
                                                        </div>
                                                    </div>
                                                )}


                                            {!roundResolved &&
                                                !slot.assigned &&
                                                !placing && (
                                                    <div className="round-battle-empty">
                                                        <span className="battle-empty-plus">
                                                            +
                                                        </span>

                                                        <div className="battle-empty-copy">
                                                            <strong>
                                                                SELECT PLAYER
                                                            </strong>

                                                            <span>
                                                                Choose someone from your roster
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}


                                            {!roundResolved &&
                                                !slot.assigned &&
                                                placing &&
                                                (
                                                    slot.isBlind ||
                                                    previewOpponent
                                                ) && (
                                                    <button
                                                        className="round-battle-preview round-battle-playable"
                                                        onClick={() =>
                                                            assignPlayerToWeek(
                                                                slot,
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <div className="battle-preview-player">
                                                            <MemoizedBattlePlayerAvatar
                                                                player={
                                                                    placing.player
                                                                }
                                                            />

                                                            <div className="battle-player-copy">
                                                                <strong>
                                                                    {
                                                                        getPlayerName(
                                                                            placing.player
                                                                        )
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        getPlayerPosition(
                                                                            placing.player
                                                                        )
                                                                    }

                                                                    {" • "}

                                                                    {
                                                                        getPlayerSeason(
                                                                            placing.player
                                                                        )
                                                                    }

                                                                    {" • "}

                                                                    {
                                                                        getPlayerTeam(
                                                                            placing.player
                                                                        )
                                                                    }
                                                                </span>

                                                                <div className="battle-preview-fantasy">
                                                                    <strong>
                                                                        {
                                                                            slot.isBlind
                                                                                ? "???"
                                                                                : Number(
                                                                                    previewFantasyPoints
                                                                                ).toFixed(
                                                                                    1
                                                                                )
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        WEEK FP
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <div className="battle-preview-vs">
                                                            VS
                                                        </div>


                                                        <div className="battle-preview-opponent">
                                                            {previewLogo && (
                                                                <img
                                                                    referrerPolicy="no-referrer"
                                                                    src={
                                                                        previewLogo
                                                                    }
                                                                    alt={`${previewOpponent} logo`}
                                                                />
                                                            )}

                                                            <div>
                                                                <span>
                                                                    OPPONENT
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        slot.isBlind
                                                                            ? "HIDDEN"
                                                                            : previewOpponent
                                                                    }
                                                                </strong>
                                                            </div>
                                                        </div>


                                                        <div className="battle-place-action">
                                                            <span>
                                                                PLACE HERE
                                                            </span>

                                                            <strong>
                                                                →
                                                            </strong>
                                                        </div>
                                                    </button>
                                                )}


                                            {!roundResolved &&
                                                !slot.assigned &&
                                                placing &&
                                                !slot.isBlind &&
                                                !previewOpponent && (
                                                    <div className="round-battle-preview round-battle-unavailable">
                                                        <div className="battle-preview-player">
                                                            <MemoizedBattlePlayerAvatar
                                                                player={
                                                                    placing.player
                                                                }
                                                            />

                                                            <div className="battle-player-copy">
                                                                <strong>
                                                                    {
                                                                        getPlayerName(
                                                                            placing.player
                                                                        )
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        getPlayerPosition(
                                                                            placing.player
                                                                        )
                                                                    }

                                                                    {" • "}

                                                                    {
                                                                        getPlayerSeason(
                                                                            placing.player
                                                                        )
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="battle-preview-vs">
                                                            ×
                                                        </div>

                                                        <div className="battle-no-game">
                                                            <strong>
                                                                NO GAME
                                                            </strong>

                                                            <span>
                                                                BYE / DNP
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}


                                            {!roundResolved &&
                                                slot.assigned && (
                                                    <div className="round-battle-assigned">
                                                        <div className="battle-assigned-player">
                                                            <MemoizedBattlePlayerAvatar
                                                                player={
                                                                    slot.assigned
                                                                }
                                                            />

                                                            <div className="battle-player-copy">
                                                                <span className="battle-small-label">
                                                                    YOUR PLAYER
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        getPlayerName(
                                                                            slot.assigned
                                                                        )
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    {
                                                                        getPlayerPosition(
                                                                            slot.assigned
                                                                        )
                                                                    }

                                                                    {" • "}

                                                                    {
                                                                        getPlayerSeason(
                                                                            slot.assigned
                                                                        )
                                                                    }

                                                                    {" • "}

                                                                    {
                                                                        getPlayerTeam(
                                                                            slot.assigned
                                                                        )
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>


                                                        <div className="battle-assigned-vs">
                                                            <span>
                                                                VS
                                                            </span>
                                                        </div>


                                                        <div className="battle-assigned-opponent">
                                                            {assignedOpponentLogo ? (
                                                                <img
                                                                    referrerPolicy="no-referrer"
                                                                    src={
                                                                        assignedOpponentLogo
                                                                    }
                                                                    alt={`${assignedOpponent} logo`}
                                                                />
                                                            ) : (
                                                                <div className="battle-opponent-placeholder">
                                                                    ?
                                                                </div>
                                                            )}

                                                            <div>
                                                                <span className="battle-small-label">
                                                                    MATCHUP
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        slot.isBlind
                                                                            ? "HIDDEN"
                                                                            : (
                                                                                assignedOpponent ||
                                                                                "UNKNOWN"
                                                                            )
                                                                    }
                                                                </strong>
                                                            </div>
                                                        </div>


                                                        <div className="battle-assigned-status">
                                                            <div className="battle-assigned-fantasy">
                                                                <strong>
                                                                    {
                                                                        slot.isBlind
                                                                            ? "???"
                                                                            : Number(
                                                                                assignedFantasyPoints ??
                                                                                0
                                                                            ).toFixed(
                                                                                1
                                                                            )
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    WEEK FP
                                                                </span>
                                                            </div>

                                                            <small>
                                                                READY
                                                            </small>
                                                        </div>
                                                    </div>
                                                )}


                                            {roundResolved &&
                                                result && (
                                                    <div className="round-battle-result">
                                                        <div className="battle-result-player battle-result-user">
                                                            <span className="battle-result-side-label">
                                                                YOU
                                                            </span>

                                                            <div className="battle-result-player-info">
                                                                <MemoizedBattlePlayerAvatar
                                                                    player={
                                                                        result.userPlayer
                                                                    }
                                                                />

                                                                <div>
                                                                    <span className="battle-result-statline">
                                                                        {
                                                                            getWeeklyResultStatLine(
                                                                                result.userPlayer,
                                                                                slot.week
                                                                            )
                                                                        }
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            getPlayerName(
                                                                                result.userPlayer
                                                                            )
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            getPlayerPosition(
                                                                                result.userPlayer
                                                                            )
                                                                        }

                                                                        {" • "}

                                                                        {
                                                                            getPlayerSeason(
                                                                                result.userPlayer
                                                                            )
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="battle-result-score">
                                                                {
                                                                    Number(
                                                                        result.userFantasy
                                                                    ).toFixed(
                                                                        1
                                                                    )
                                                                }

                                                                <small>
                                                                    FP
                                                                </small>
                                                            </div>
                                                        </div>


                                                        <div className="battle-result-center">
                                                            <span>
                                                                VS
                                                            </span>

                                                            <strong>
                                                                {roundResult?.winCondition ===
                                                                    "BEST_BALL"
                                                                    ? result.userFantasy ===
                                                                        result.cpuFantasy
                                                                        ? "EVEN"
                                                                        : result.userFantasy >
                                                                            result.cpuFantasy
                                                                            ? `YOU +${(
                                                                                result.userFantasy -
                                                                                result.cpuFantasy
                                                                            ).toFixed(1)} FP`
                                                                            : `CPU +${(
                                                                                result.cpuFantasy -
                                                                                result.userFantasy
                                                                            ).toFixed(1)} FP`
                                                                    : result.winner ===
                                                                        "user"
                                                                        ? "YOU WIN"
                                                                        : result.winner ===
                                                                            "cpu"
                                                                            ? "CPU WINS"
                                                                            : "TIE"}
                                                            </strong>
                                                        </div>


                                                        <div className="battle-result-player battle-result-cpu">
                                                            <span className="battle-result-side-label">
                                                                CPU
                                                            </span>

                                                            <div className="battle-result-player-info">
                                                                <MemoizedBattlePlayerAvatar
                                                                    player={
                                                                        result.cpuPlayer
                                                                    }
                                                                />

                                                                <div>
                                                                    <span className="battle-result-statline">
                                                                        {
                                                                            getWeeklyResultStatLine(
                                                                                result.cpuPlayer,
                                                                                slot.week
                                                                            )
                                                                        }
                                                                    </span>

                                                                    <strong>
                                                                        {
                                                                            getPlayerName(
                                                                                result.cpuPlayer
                                                                            )
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            getPlayerPosition(
                                                                                result.cpuPlayer
                                                                            )
                                                                        }

                                                                        {" • "}

                                                                        {
                                                                            getPlayerSeason(
                                                                                result.cpuPlayer
                                                                            )
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="battle-result-score">
                                                                {
                                                                    Number(
                                                                        result.cpuFantasy
                                                                    ).toFixed(
                                                                        1
                                                                    )
                                                                }

                                                                <small>
                                                                    FP
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    );
                                }
                            )}
                        </div>


                        {roundResolved &&
                            roundResult &&
                            resultsRevealDone && (
                                <div
                                    className={[
                                        "round-result-panel",
                                        roundResult.userWonRound
                                            ? "round-result-win"
                                            : "round-result-loss",
                                    ].join(
                                        " "
                                    )}
                                >
                                    <div className="round-result-eyebrow">
                                        {roundResult.userWonRound
                                            ? "ROUND WON"
                                            : "ROUND LOST"}

                                        {roundResult.winCondition ===
                                            "BEST_BALL"
                                            ? " • BEST BALL"
                                            : ""}
                                    </div>

                                    <h2>
                                        {roundResult.winCondition ===
                                            "BEST_BALL"
                                            ? `${roundResult.userTotal.toFixed(1)} - ${roundResult.cpuTotal.toFixed(1)} FP`
                                            : `${roundResult.userCategoryWins} - ${roundResult.cpuCategoryWins}`}
                                    </h2>

                                    <div className="round-result-totals">
                                        <div>
                                            <span>
                                                YOUR TOTAL
                                            </span>

                                            <strong>
                                                {
                                                    roundResult.userTotal.toFixed(
                                                        1
                                                    )
                                                } FP
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                CPU TOTAL
                                            </span>

                                            <strong>
                                                {
                                                    roundResult.cpuTotal.toFixed(
                                                        1
                                                    )
                                                } FP
                                            </strong>
                                        </div>
                                    </div>

                                    {roundResult.userWonRound ? (
                                        <button
                                            className="round-next-button"
                                            onClick={
                                                openPerkReward
                                            }
                                        >
                                            {round ===
                                                MAX_ROUNDS &&
                                                !endlessMode
                                                ? "CONQUER GAUNTLET"
                                                : "CLAIM PERK"}
                                        </button>
                                    ) : (
                                        <button
                                            className="round-next-button"
                                            onClick={
                                                handleRoundLoss
                                            }
                                        >
                                            {secondWindReady
                                                ? "♻️ USE SECOND WIND"
                                                : "END RUN"}
                                        </button>
                                    )}
                                </div>
                            )}
                    </section>


                    {/* =================================================
                    CPU PLAYERS
                   ================================================= */}

                    <aside className="round-opponent-panel">
                        <div className="round-panel-heading">
                            <span>
                                OPPONENT
                            </span>

                            <small>
                                {filmStudyReveals.length >
                                    0 &&
                                    !roundResolved
                                    ? `${filmStudyReveals.length} PLACEMENTS REVEALED`
                                    : "PLACEMENTS HIDDEN"}
                            </small>
                        </div>

                        <div className="round-opponent-cards">
                            {currentOpponent.map(
                                (
                                    player,
                                    index
                                ) => (
                                    <div
                                        className="round-opponent-card-wrap"
                                        key={`${getPlayerId(player)}-${index}`}
                                    >
                                        <PlayerCard
                                            player={player}
                                            variant="draft"
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </aside>
                </main>
            </div>

        </div>
    );
}