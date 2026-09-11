// Lightweight client-side fetcher for nflfastR community CSVs
// Caches per-season CSV in localStorage under key: nfl_stats_<season>

import { computeFantasyForGame } from "../engine/FantasyCalculator.js";

const BASE_RAW =
    "https://raw.githubusercontent.com/guga31bb/nflfastR-data/master/data/player_stats/player_stats_";

// Generate N unique random week numbers (1-17)
// Higher rounds bias toward later weeks.
export function generateWeekCategories(round, count = 7) {
    const weeks = new Set();
    const maxWeek = 17;

    const bias = Math.min(0.35 + (round - 1) * 0.06, 0.9);

    while (weeks.size < count) {
        const r = Math.random();

        let week;

        if (r < bias) {
            // Prefer weeks 7-17
            week = Math.floor(Math.random() * 11) + 7;
        } else {
            // Any regular-season week
            week = Math.floor(Math.random() * maxWeek) + 1;
        }

        weeks.add(Math.min(Math.max(1, week), maxWeek));
    }

    return Array.from(weeks).sort((a, b) => a - b);
}


// ---------------------------------------------------------
// Fetch an entire season
// ---------------------------------------------------------

async function fetchSeasonCsv(season) {
    const cacheKey = `nfl_stats_${season}`;

    try {
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }
    } catch (e) {
        console.warn("nflApi: localStorage read failed", e);
    }

    const url = `${BASE_RAW}${season}.csv`;

    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const text = await res.text();
        const data = parseCsv(text);

        try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (e) {
            console.warn("nflApi: localStorage write failed", e);
        }

        return data;
    } catch (err) {
        console.warn("nflApi: fetch failed for", url, err);
        return [];
    }
}


// ---------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------

function parseCsv(text) {
    const lines = text
        .split("\n")
        .filter((line) => line.trim().length > 0);

    if (lines.length === 0) {
        return [];
    }

    const headers = lines[0]
        .split(",")
        .map((h) => h.replace(/\r/g, "").trim());

    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = splitCsvLine(lines[i]);

        if (cols.length !== headers.length) {
            continue;
        }

        const obj = {};

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = cols[j];
        }

        rows.push(obj);
    }

    return rows;
}


// Simple CSV splitter that respects quoted commas
function splitCsvLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += ch;
        }
    }

    result.push(current);

    return result.map((s) =>
        s.replace(/^"|"$/g, "").trim()
    );
}


// ---------------------------------------------------------
// Normalize a player-game row
// ---------------------------------------------------------

function normalizeRow(row) {
    const get = (...candidates) => {
        for (const key of candidates) {
            if (key in row) {
                return row[key];
            }
        }

        return undefined;
    };

    const season =
        Number(get("season", "Year") || get("season_id")) || undefined;

    const week =
        Number(get("week")) || undefined;

    const name =
        get("player_name", "player") ||
        get("name") ||
        "";

    const team =
        get("team", "team_playing") ||
        "";

    const player_id =
        get("player_id") ||
        get("gsis_id") ||
        get("player_id_old") ||
        null;

    const stats = {
        passing_yards:
            Number(get("passing_yards", "pass_yds", "pass_yd")) || 0,

        passing_tds:
            Number(get("passing_tds", "pass_td")) || 0,

        rushing_yards:
            Number(get("rushing_yards", "rush_yds")) || 0,

        rushing_tds:
            Number(get("rushing_tds", "rush_td")) || 0,

        receptions:
            Number(get("receptions", "rec")) || 0,

        receiving_yards:
            Number(get("receiving_yards", "rec_yds")) || 0,

        receiving_tds:
            Number(get("receiving_tds", "rec_td")) || 0,

        interceptions:
            Number(get("interceptions", "ints")) || 0,

        fumbles_lost:
            Number(get("fumbles_lost", "fumbles")) || 0,
    };

    const fpts = computeFantasyForGame(stats);

    return {
        season,
        week,
        name,
        team,
        player_id,
        stats,
        fpts,
    };
}


// ---------------------------------------------------------
// Player games
// ---------------------------------------------------------

export async function fetchPlayerGamesForSeason(
    season,
    playerName
) {
    const data = await fetchSeasonCsv(season);

    if (!data || data.length === 0) {
        return [];
    }

    const searchName = playerName.toLowerCase();

    const matches = data.filter((row) => {
        const name =
            row.player_name ||
            row.player ||
            row.name ||
            "";

        return name.toLowerCase().includes(searchName);
    });

    return matches
        .map(normalizeRow)
        .filter((row) => row.week != null);
}


// ---------------------------------------------------------
// Available weeks
// ---------------------------------------------------------

export async function getAvailableWeeksForPlayer(player) {
    if (!player || !player.year) {
        return [];
    }

    const games = await fetchPlayerGamesForSeason(
        player.year,
        player.name
    );

    const weeks = games
        .map((game) => game.week)
        .filter(
            (value, index, array) =>
                array.indexOf(value) === index
        )
        .sort((a, b) => a - b);

    return weeks;
}


// ---------------------------------------------------------
// Random week
// ---------------------------------------------------------

export async function getRandomWeekForPlayer(player) {
    if (!player || !player.year) {
        return null;
    }

    const games = await fetchPlayerGamesForSeason(
        player.year,
        player.name
    );

    if (!games || games.length === 0) {
        return null;
    }

    const index = Math.floor(
        Math.random() * games.length
    );

    return games[index];
}


// ---------------------------------------------------------
// Generate opponent
// ---------------------------------------------------------
export async function generateOpponentForRound(
    playerPool,
    round,
    weekCategories = null
) {
    const SLOT_POSITIONS = [
        "QB",
        "RB",
        "RB",
        "WR",
        "WR",
        "TE",
        "FLEX",
    ];

    const pool = Array.isArray(playerPool)
        ? playerPool.filter(Boolean)
        : [];

    const opponent = [];

    if (pool.length === 0) {
        return {
            opponent: [],
            bench: {
                name: "Bench",
                fpts: 0,
            },
        };
    }

    /*
     * HEAVY RANDOMIZATION
     */

    const random = (min, max) =>
        Math.random() * (max - min) + min;

    const randomInt = (min, max) =>
        Math.floor(random(min, max + 1));

    const pick = (array) => {
        if (!array.length) return null;
        return array[
            Math.floor(Math.random() * array.length)
        ];
    };

    /*
     * Round difficulty.
     *
     * Early rounds:
     *   weaker/more volatile opponents
     *
     * Later rounds:
     *   stronger opponents
     */

    const difficulty = Math.min(
        0.25 + round * 0.07,
        0.95
    );

    /*
     * Random week.
     */

    const availableWeeks =
        Array.isArray(weekCategories) &&
            weekCategories.length
            ? weekCategories
            : generateWeekCategories(
                round,
                7
            );

    /*
     * Get a random player for a slot.
     */

    function getRandomPlayer(position) {
        let candidates;

        if (position === "FLEX") {
            candidates = pool.filter((p) =>
                ["RB", "WR", "TE"].includes(
                    String(
                        p.pos ||
                        p.position ||
                        ""
                    ).toUpperCase()
                )
            );
        } else {
            candidates = pool.filter(
                (p) =>
                    String(
                        p.pos ||
                        p.position ||
                        ""
                    ).toUpperCase() === position
            );
        }

        /*
         * If there aren't enough position matches,
         * fall back to the entire pool.
         */

        if (!candidates.length) {
            candidates = pool;
        }

        return pick(candidates);
    }


    /*
     * Generate a randomized fantasy performance.
     */

    function randomizePerformance(
        player,
        position
    ) {
        const baseFpts =
            Number(player.fpts) || 10;

        /*
         * Huge variation.
         *
         * Example:
         * base = 15
         *
         * can become anywhere from roughly
         * 5 to 30 depending on round/difficulty.
         */

        const volatility =
            position === "QB"
                ? 0.65
                : 0.85;

        const swing =
            random(
                -baseFpts * volatility,
                baseFpts *
                volatility *
                (1 + difficulty)
            );

        let fpts =
            baseFpts + swing;

        /*
         * Rare monster games.
         */

        if (Math.random() < 0.08) {
            fpts *= random(1.35, 1.8);
        }

        /*
         * Rare terrible games.
         */

        if (Math.random() < 0.08) {
            fpts *= random(0.25, 0.55);
        }

        /*
         * Keep scores reasonable.
         */

        fpts = Math.max(
            0,
            Math.min(55, fpts)
        );

        /*
         * Random yardage.
         */

        let yards;

        if (position === "QB") {
            yards = randomInt(140, 430);
        } else if (
            position === "RB"
        ) {
            yards = randomInt(20, 220);
        } else if (
            position === "WR" ||
            position === "TE"
        ) {
            yards = randomInt(10, 240);
        } else {
            yards = randomInt(20, 220);
        }

        /*
         * Touchdowns.
         */

        let tds = 0;

        const tdChance =
            position === "QB"
                ? 0.55
                : 0.45;

        if (Math.random() < tdChance) {
            tds = randomInt(1, 3);
        }

        /*
         * Turnovers.
         */

        let turnovers = 0;

        if (Math.random() < 0.28) {
            turnovers = randomInt(1, 2);
        }

        return {
            fpts: Number(
                fpts.toFixed(2)
            ),
            yards,
            tds,
            turnovers,
        };
    }


    /*
     * Generate every roster slot.
     */

    for (const position of SLOT_POSITIONS) {
        const player =
            getRandomPlayer(position);

        if (!player) continue;

        const week = pick(
            availableWeeks
        );

        const performance =
            randomizePerformance(
                player,
                position
            );

        opponent.push({
            ...player,

            pos:
                player.pos ||
                player.position ||
                position,

            year:
                player.year ||
                player.season,

            week,

            fpts:
                performance.fpts,

            yards:
                performance.yards,

            tds:
                performance.tds,

            turnovers:
                performance.turnovers,
        });
    }


    /*
     * Randomize lineup order slightly.
     */

    for (
        let i = opponent.length - 1;
        i > 0;
        i--
    ) {
        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            opponent[i],
            opponent[j],
        ] = [
                opponent[j],
                opponent[i],
            ];
    }


    return {
        opponent,

        bench: {
            name: "Bench",
            season: null,
            week: null,
            pos: null,
            fpts: Number(
                random(0, 8).toFixed(2)
            ),
        },
    };
}

// Export helper for season stats
export {
    fetchSeasonCsv as fetchSeasonStats,
};