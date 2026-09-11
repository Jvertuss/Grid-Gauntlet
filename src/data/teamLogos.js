/*
 * =========================================================
 * GRIDIRON GAUNTLET - NFL TEAM LOGOS
 * =========================================================
 *
 * Maps NFL team abbreviations from the NFL database
 * to their team logo images.
 *
 * The PlayerCard uses:
 *
 *     TEAM_LOGOS[team]
 *
 * Example:
 *
 *     TEAM_LOGOS["KC"]
 *
 * =========================================================
 */

const TEAM_LOGOS = {
    // AFC EAST
    BUF: "https://static.www.nfl.com/league/api/clubs/logos/BUF.svg",
    MIA: "https://static.www.nfl.com/league/api/clubs/logos/MIA.svg",
    NE: "https://static.www.nfl.com/league/api/clubs/logos/NE.svg",
    NYJ: "https://static.www.nfl.com/league/api/clubs/logos/NYJ.svg",

    // AFC NORTH
    BAL: "https://static.www.nfl.com/league/api/clubs/logos/BAL.svg",
    CIN: "https://static.www.nfl.com/league/api/clubs/logos/CIN.svg",
    CLE: "https://static.www.nfl.com/league/api/clubs/logos/CLE.svg",
    PIT: "https://static.www.nfl.com/league/api/clubs/logos/PIT.svg",

    // AFC SOUTH
    HOU: "https://static.www.nfl.com/league/api/clubs/logos/HOU.svg",
    IND: "https://static.www.nfl.com/league/api/clubs/logos/IND.svg",
    JAX: "https://static.www.nfl.com/league/api/clubs/logos/JAX.svg",
    TEN: "https://static.www.nfl.com/league/api/clubs/logos/TEN.svg",

    // AFC WEST
    DEN: "https://static.www.nfl.com/league/api/clubs/logos/DEN.svg",
    KC: "https://static.www.nfl.com/league/api/clubs/logos/KC.svg",
    LV: "https://static.www.nfl.com/league/api/clubs/logos/LV.svg",
    LAC: "https://static.www.nfl.com/league/api/clubs/logos/LAC.svg",

    // NFC EAST
    DAL: "https://static.www.nfl.com/league/api/clubs/logos/DAL.svg",
    NYG: "https://static.www.nfl.com/league/api/clubs/logos/NYG.svg",
    PHI: "https://static.www.nfl.com/league/api/clubs/logos/PHI.svg",
    WAS: "https://static.www.nfl.com/league/api/clubs/logos/WAS.svg",

    // NFC NORTH
    CHI: "https://static.www.nfl.com/league/api/clubs/logos/CHI.svg",
    DET: "https://static.www.nfl.com/league/api/clubs/logos/DET.svg",
    GB: "https://static.www.nfl.com/league/api/clubs/logos/GB.svg",
    MIN: "https://static.www.nfl.com/league/api/clubs/logos/MIN.svg",

    // NFC SOUTH
    ATL: "https://static.www.nfl.com/league/api/clubs/logos/ATL.svg",
    CAR: "https://static.www.nfl.com/league/api/clubs/logos/CAR.svg",
    NO: "https://static.www.nfl.com/league/api/clubs/logos/NO.svg",
    TB: "https://static.www.nfl.com/league/api/clubs/logos/TB.svg",

    // NFC WEST
    ARI: "https://static.www.nfl.com/league/api/clubs/logos/ARI.svg",
    LAR: "https://static.www.nfl.com/league/api/clubs/logos/LAR.svg",
    SF: "https://static.www.nfl.com/league/api/clubs/logos/SF.svg",
    SEA: "https://static.www.nfl.com/league/api/clubs/logos/SEA.svg"
};

export default TEAM_LOGOS;