// =========================================================
// GRIDIRON GAUNTLET
// PERKS
// =========================================================

export const PERKS = {

    // =====================================================
    // TIME TRAVEL
    // =====================================================

    TIME_TRAVEL: {
        id: "TIME_TRAVEL",
        name: "Time Travel",
        label: "Time Travel",
        icon: "⏪",

        description:
            "Choose one roster player and switch them to another available historical season.",
    },


    // =====================================================
    // TEAMMATES
    // =====================================================

    TEAMMATES: {
        id: "TEAMMATES",
        name: "Teammates",
        label: "Teammates",
        icon: "🤝",

        description:
            "Choose one roster player and acquire a legal teammate from the same team and season.",
    },


    // =====================================================
    // TRADING
    // =====================================================

    TRADING: {
        id: "TRADING",
        name: "Trading",
        label: "Trading",
        icon: "🔄",

        description:
            "Trade one of your roster players for a player from the opponent roster you just defeated.",
    },


    // =====================================================
    // BOOSTER PACK
    // =====================================================

    BOOSTER_PACK: {
        id: "BOOSTER_PACK",
        name: "Booster Pack",
        label: "Booster Pack",
        icon: "🎁",

        description:
            "Open a pack of NFL player-seasons and choose one. Packs become stronger in later rounds.",
    },


    // =====================================================
    // BENCH
    // =====================================================

    BENCH: {
        id: "BENCH",
        name: "Bench",
        label: "Bench",
        icon: "🪑",

        description:
            "Unlock one permanent reserve roster slot. Keep an eighth player and swap them into your active roster between rounds.",
    },


    // =====================================================
    // FILM STUDY
    // =====================================================

    FILM_STUDY: {
        id: "FILM_STUDY",
        name: "Film Study",
        label: "Film Study",
        icon: "🎥",

        description:
            "Reveal two non-Blind opponent placements during your next round without revealing their fantasy scores.",
    },


    // =====================================================
    // TRADE MARKET
    // =====================================================

    TRADE_MARKET: {
        id: "TRADE_MARKET",
        name: "Trade Market",
        label: "Trade Market",
        icon: "📈",

        description:
            "Choose from three generated trade offers. Compare player value carefully because not every deal is a good one.",
    },


    // =====================================================
    // TE PREMIUM
    // RARE
    //
    // Lasts 3 rounds.
    // =====================================================

    TE_PREMIUM: {
        id: "TE_PREMIUM",
        name: "TE Premium",
        label: "TE Premium",
        icon: "🧤",

        badge: "RARE",
        rarity: "RARE",

        description:
            "For the next 3 rounds, your TEs gain +0.5 fantasy points for every reception.",
    },


    // =====================================================
    // PERFECT VISION
    // RARE
    //
    // Next round only.
    // =====================================================

    PERFECT_VISION: {
        id: "PERFECT_VISION",
        name: "Perfect Vision",
        label: "Perfect Vision",
        icon: "👁️",

        badge: "RARE",
        rarity: "RARE",

        description:
            "For the next round, every Mystery Week becomes fully visible.",
    },


    // =====================================================
    // BLACKOUT
    // RARE
    //
    // Next round:
    // every week becomes a Mystery Week.
    //
    // Win:
    // choose 2 perks.
    // =====================================================

    BLACKOUT: {
        id: "BLACKOUT",
        name: "Blackout",
        label: "Blackout",
        icon: "🌑",

        badge: "RARE",
        rarity: "RARE",

        description:
            "Next round, all 7 weeks become Mystery Weeks. Win and choose 2 perks.",
    },


    // =====================================================
    // WEEK SCRAMBLER
    // RARE
    //
    // Gives exactly 2 uses for the entire run.
    // =====================================================

    WEEK_SCRAMBLER: {
        id: "WEEK_SCRAMBLER",
        name: "Week Scrambler",
        label: "Week Scrambler",
        icon: "🌀",

        badge: "RARE",
        rarity: "RARE",

        description:
            "Gain 2 uses to regenerate all 7 weeks before placing a player. Your opponent roster stays the same.",
    },


    // =====================================================
    // SECOND WIND
    //
    // Badge still says RARE.
    // Legendary card styling.
    // =====================================================

    SECOND_WIND: {
        id: "SECOND_WIND",
        name: "Second Wind",
        label: "Second Wind",
        icon: "♻️",

        badge: "RARE",
        rarity: "LEGENDARY",

        description:
            "Gain one extra life. If you lose, retry the same round against a completely new opponent.",
    },


    // =====================================================
    // DIVISION RIVAL
    // LEGENDARY
    // =====================================================

    DIVISION_RIVAL: {
        id: "DIVISION_RIVAL",
        name: "Division Rival",
        label: "Division Rival",
        icon: "⚔️",

        badge: "LEGENDARY",
        rarity: "LEGENDARY",

        description:
            "Lock one roster player, spin for a random division rival from that season, then choose one legal rival player to replace them.",
    },


    // =====================================================
    // BEST BALL
    // LEGENDARY
    //
    // Lasts 2 rounds.
    //
    // Normal mode:
    // win 4 of 7 Week Battles.
    //
    // Best Ball:
    // individual Week Battle wins do not matter.
    // Highest combined fantasy-point total wins.
    // =====================================================

    BEST_BALL: {
        id: "BEST_BALL",
        name: "Best Ball",
        label: "Best Ball",
        icon: "🏆",

        badge: "LEGENDARY",
        rarity: "LEGENDARY",

        description:
            "For the next 2 rounds, ignore the 4-of-7 battle count. Add all 7 fantasy scores together. Highest total fantasy points wins.",
    },


    // =====================================================
    // WILDCARD ROSTER
    // LEGENDARY
    //
    // Permanent for the entire run.
    // =====================================================

    WILDCARD_ROSTER: {
        id: "WILDCARD_ROSTER",
        name: "Wildcard Roster",
        label: "Wildcard Roster",
        icon: "🃏",

        badge: "LEGENDARY",
        rarity: "LEGENDARY",

        description:
            "Permanently remove positional roster requirements. Your 7 active players may be any combination of QB, RB, WR, and TE.",
    },
};


// =========================================================
// ALL PERKS
// =========================================================

export const PERK_LIST =
    Object.values(
        PERKS
    );


// =========================================================
// NORMAL PERK POOL
//
// These are removed because they use their own special rolls:
//
// Second Wind
// Division Rival
// Best Ball
// Wildcard Roster
// =========================================================

export const NORMAL_PERK_LIST =
    PERK_LIST.filter(
        (perk) =>
            perk.id !== "SECOND_WIND" &&
            perk.id !== "DIVISION_RIVAL" &&
            perk.id !== "BEST_BALL" &&
            perk.id !== "WILDCARD_ROSTER"
    );


// =========================================================
// SHUFFLE
// =========================================================

export function shufflePerks(
    items
) {
    const copy =
        [...items];


    for (
        let index =
            copy.length - 1;

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


// =========================================================
// BOOSTER PACK
// =========================================================

function getSafeRound(
    round
) {
    return Math.max(
        1,
        Math.min(
            9,
            Number(
                round
            ) ||
            1
        )
    );
}


// =========================================================
// BOOSTER PACK ROUND CONFIG
// =========================================================

export const BOOSTER_PACK_ROUND_CONFIG = {

    1: {
        choices: 3,

        BASE: 0.85,
        GOLD: 0.15,
        PLATINUM: 0.00,
    },


    2: {
        choices: 3,

        BASE: 0.80,
        GOLD: 0.20,
        PLATINUM: 0.00,
    },


    3: {
        choices: 3,

        BASE: 0.75,
        GOLD: 0.24,
        PLATINUM: 0.01,
    },


    4: {
        choices: 4,

        BASE: 0.65,
        GOLD: 0.32,
        PLATINUM: 0.03,
    },


    5: {
        choices: 4,

        BASE: 0.55,
        GOLD: 0.40,
        PLATINUM: 0.05,
    },


    6: {
        choices: 4,

        BASE: 0.45,
        GOLD: 0.45,
        PLATINUM: 0.10,
    },


    7: {
        choices: 5,

        BASE: 0.30,
        GOLD: 0.50,
        PLATINUM: 0.20,
    },


    8: {
        choices: 5,

        BASE: 0.20,
        GOLD: 0.55,
        PLATINUM: 0.25,
    },


    9: {
        choices: 5,

        BASE: 0.15,
        GOLD: 0.55,
        PLATINUM: 0.30,
    },
};


// =========================================================
// GET BOOSTER PACK CONFIG
// =========================================================

export function getBoosterPackConfig(
    round
) {
    const safeRound =
        getSafeRound(
            round
        );


    return (
        BOOSTER_PACK_ROUND_CONFIG[
        safeRound
        ] ||
        BOOSTER_PACK_ROUND_CONFIG[
        1
        ]
    );
}


// =========================================================
// BOOSTER PACK CHOICE COUNT
// =========================================================

export function getBoosterPackChoiceCount(
    round
) {
    return (
        getBoosterPackConfig(
            round
        )?.choices ||
        3
    );
}


// =========================================================
// BOOSTER RARITY ODDS
// =========================================================

export function getBoosterRarityOdds(
    round
) {
    const config =
        getBoosterPackConfig(
            round
        );


    return {
        BASE:
            config.BASE,

        GOLD:
            config.GOLD,

        PLATINUM:
            config.PLATINUM,
    };
}


// =========================================================
// ROLL BOOSTER PACK RARITY
// =========================================================

export function rollBoosterRarity(
    round
) {
    const config =
        getBoosterPackConfig(
            round
        );


    const roll =
        Math.random();


    if (
        roll <
        config.BASE
    ) {
        return "BASE";
    }


    if (
        roll <
        config.BASE +
        config.GOLD
    ) {
        return "GOLD";
    }


    return "PLATINUM";
}


// =========================================================
// SPECIAL PERK ROLLS
//
// These values are internal.
// They are NOT displayed on PerkCard.
// =========================================================

export const SECOND_WIND_APPEARANCE_CHANCE =
    0.10;


export const DIVISION_RIVAL_APPEARANCE_CHANCE =
    0.20;


export const BEST_BALL_APPEARANCE_CHANCE =
    0.10;


export const WILDCARD_ROSTER_APPEARANCE_CHANCE =
    0.10;


// =========================================================
// SECOND WIND
// =========================================================

export function shouldSecondWindAppear({
    secondWindAcquired = false,
} = {}) {

    if (
        secondWindAcquired
    ) {
        return false;
    }


    return (
        Math.random() <
        SECOND_WIND_APPEARANCE_CHANCE
    );
}


// =========================================================
// DIVISION RIVAL
// =========================================================

export function shouldDivisionRivalAppear() {
    return (
        Math.random() <
        DIVISION_RIVAL_APPEARANCE_CHANCE
    );
}


// =========================================================
// LEGENDARY ROLL
//
// Only ONE Legendary can occupy the Legendary reward slot.
//
// 0.00 - 0.20
// Division Rival
//
// 0.20 - 0.30
// Best Ball
//
// 0.30 - 0.40
// Wildcard Roster
//
// 0.40 - 1.00
// No Legendary
//
// If Best Ball is already active,
// its section returns nothing.
//
// If Wildcard Roster is already owned,
// its section returns nothing.
//
// Odds are not redistributed.
// =========================================================

export function rollLegendaryPerk({
    bestBallActive = false,

    wildcardRosterUnlocked = false,
} = {}) {

    const roll =
        Math.random();


    // =====================================================
    // DIVISION RIVAL
    // =====================================================

    if (
        roll <
        DIVISION_RIVAL_APPEARANCE_CHANCE
    ) {
        return PERKS.DIVISION_RIVAL;
    }


    // =====================================================
    // BEST BALL
    // =====================================================

    if (
        roll <
        DIVISION_RIVAL_APPEARANCE_CHANCE +
        BEST_BALL_APPEARANCE_CHANCE
    ) {
        if (
            bestBallActive
        ) {
            return null;
        }


        return PERKS.BEST_BALL;
    }


    // =====================================================
    // WILDCARD ROSTER
    // =====================================================

    if (
        roll <
        DIVISION_RIVAL_APPEARANCE_CHANCE +
        BEST_BALL_APPEARANCE_CHANCE +
        WILDCARD_ROSTER_APPEARANCE_CHANCE
    ) {
        if (
            wildcardRosterUnlocked
        ) {
            return null;
        }


        return PERKS.WILDCARD_ROSTER;
    }


    return null;
}


// =========================================================
// GET AVAILABLE NORMAL PERKS
// =========================================================

function getAvailableNormalPerks({
    benchUnlocked = false,

    filmStudyAcquired = false,

    tePremiumActive = false,

    weekScramblerAcquired = false,
} = {}) {

    return NORMAL_PERK_LIST.filter(
        (perk) => {

            // =================================================
            // BENCH
            //
            // Permanent.
            // Remove after unlocking.
            // =================================================

            if (
                perk.id ===
                "BENCH" &&
                benchUnlocked
            ) {
                return false;
            }


            // =================================================
            // FILM STUDY
            //
            // Permanent.
            // Remove after acquisition.
            // =================================================

            if (
                perk.id ===
                "FILM_STUDY" &&
                filmStudyAcquired
            ) {
                return false;
            }


            // =================================================
            // TE PREMIUM
            //
            // Remove while active.
            //
            // It may return after its
            // 3 rounds expire.
            // =================================================

            if (
                perk.id ===
                "TE_PREMIUM" &&
                tePremiumActive
            ) {
                return false;
            }


            // =================================================
            // WEEK SCRAMBLER
            //
            // One acquisition gives
            // exactly 2 uses.
            //
            // Never offer it again.
            // =================================================

            if (
                perk.id ===
                "WEEK_SCRAMBLER" &&
                weekScramblerAcquired
            ) {
                return false;
            }


            return true;
        }
    );
}


// =========================================================
// GENERATE PERK CHOICES
//
// Three reward cards.
//
// Second Wind:
// separate special roll.
//
// Legendary perks:
// one shared Legendary slot.
//
// Remaining slots:
// normal perk pool.
// =========================================================

export function generatePerkChoices(
    round,

    amount = 3,

    {
        secondWindAcquired = false,

        benchUnlocked = false,

        filmStudyAcquired = false,

        tePremiumActive = false,

        weekScramblerAcquired = false,

        bestBallActive = false,

        wildcardRosterUnlocked = false,
    } = {}
) {

    void round;


    const safeAmount =
        Math.max(
            1,
            Number(
                amount
            ) ||
            3
        );


    // =====================================================
    // NORMAL PERKS
    // =====================================================

    let availableNormalPerks =
        getAvailableNormalPerks({
            benchUnlocked,

            filmStudyAcquired,

            tePremiumActive,

            weekScramblerAcquired,
        });


    availableNormalPerks =
        shufflePerks(
            availableNormalPerks
        );


    // =====================================================
    // SPECIAL PERKS
    // =====================================================

    const specialPerks =
        [];


    // =====================================================
    // SECOND WIND
    // =====================================================

    if (
        shouldSecondWindAppear({
            secondWindAcquired,
        })
    ) {
        specialPerks.push(
            PERKS.SECOND_WIND
        );
    }


    // =====================================================
    // LEGENDARY SLOT
    // =====================================================

    const legendaryPerk =
        rollLegendaryPerk({
            bestBallActive,

            wildcardRosterUnlocked,
        });


    if (
        legendaryPerk
    ) {
        specialPerks.push(
            legendaryPerk
        );
    }


    // =====================================================
    // NUMBER OF NORMAL CARDS NEEDED
    // =====================================================

    const normalCardCount =
        Math.max(
            0,
            safeAmount -
            specialPerks.length
        );


    // =====================================================
    // FINAL REWARD SCREEN
    // =====================================================

    const rewardChoices = [
        ...availableNormalPerks.slice(
            0,
            normalCardCount
        ),

        ...specialPerks,
    ];


    return shufflePerks(
        rewardChoices
    ).slice(
        0,
        safeAmount
    );
}


// =========================================================
// GET PERK BY ID
// =========================================================

export function getPerkById(
    perkId
) {
    return (
        PERK_LIST.find(
            (perk) =>
                perk.id ===
                perkId
        ) ||
        null
    );
}


// =========================================================
// CHECK IF PERK IS CURRENTLY AVAILABLE
// =========================================================

export function isPerkAvailable(
    perkId,

    {
        secondWindAcquired = false,

        benchUnlocked = false,

        filmStudyAcquired = false,

        tePremiumActive = false,

        weekScramblerAcquired = false,

        bestBallActive = false,

        wildcardRosterUnlocked = false,
    } = {}
) {

    // =====================================================
    // SECOND WIND
    // =====================================================

    if (
        perkId ===
        "SECOND_WIND" &&
        secondWindAcquired
    ) {
        return false;
    }


    // =====================================================
    // BENCH
    // =====================================================

    if (
        perkId ===
        "BENCH" &&
        benchUnlocked
    ) {
        return false;
    }


    // =====================================================
    // FILM STUDY
    // =====================================================

    if (
        perkId ===
        "FILM_STUDY" &&
        filmStudyAcquired
    ) {
        return false;
    }


    // =====================================================
    // TE PREMIUM
    // =====================================================

    if (
        perkId ===
        "TE_PREMIUM" &&
        tePremiumActive
    ) {
        return false;
    }


    // =====================================================
    // WEEK SCRAMBLER
    // =====================================================

    if (
        perkId ===
        "WEEK_SCRAMBLER" &&
        weekScramblerAcquired
    ) {
        return false;
    }


    // =====================================================
    // BEST BALL
    //
    // Can return after the
    // 2-round effect expires.
    // =====================================================

    if (
        perkId ===
        "BEST_BALL" &&
        bestBallActive
    ) {
        return false;
    }


    // =====================================================
    // WILDCARD ROSTER
    //
    // Permanent.
    // Never offered again.
    // =====================================================

    if (
        perkId ===
        "WILDCARD_ROSTER" &&
        wildcardRosterUnlocked
    ) {
        return false;
    }


    return Boolean(
        getPerkById(
            perkId
        )
    );
}