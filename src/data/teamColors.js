// =========================================================
// GRIDIRON GAUNTLET
// NFL TEAM COLORS
//
// primary   = darker/base team identity
// secondary = secondary team color
// accent    = bright recognizable color used for:
//             - Fantasy points
//             - Headshot ring
//             - Selected glow
//             - Card accent stripe
// =========================================================

const TEAM_COLORS = {

    /* =====================================================
       NFC WEST
       ===================================================== */

    ARI: {
        primary: "#97233F",
        secondary: "#FFB612",
        accent: "#E31837",
    },

    LAR: {
        primary: "#003594",
        secondary: "#FFA300",
        accent: "#2D6CDF",
    },

    SF: {
        primary: "#AA0000",
        secondary: "#B3995D",
        accent: "#E31837",
    },

    SEA: {
        primary: "#002244",
        secondary: "#69BE28",

        // Seahawks green pops much better on dark cards
        accent: "#69BE28",
    },


    /* =====================================================
       NFC NORTH
       ===================================================== */

    CHI: {
        primary: "#0B162A",
        secondary: "#C83803",

        // Bears orange
        accent: "#F15A22",
    },

    DET: {
        primary: "#0076B6",
        secondary: "#B0B7BC",

        // Honolulu blue
        accent: "#29A9E8",
    },

    GB: {
        primary: "#203731",
        secondary: "#FFB612",

        // Gold is much more visible than dark green
        accent: "#FFB612",
    },

    MIN: {
        primary: "#4F2683",
        secondary: "#FFC62F",

        // Brighter Vikings purple
        accent: "#8C5ACB",
    },


    /* =====================================================
       NFC SOUTH
       ===================================================== */

    ATL: {
        primary: "#A71930",
        secondary: "#000000",
        accent: "#E03A3E",
    },

    CAR: {
        /*
         * Panthers:
         * Keep the base dark but make Carolina blue
         * the dominant visual accent.
         */
        primary: "#101820",
        secondary: "#BFC0BF",
        accent: "#00AEEF",
    },

    NO: {
        /*
         * Saints:
         * Gold/champagne should be what jumps out.
         */
        primary: "#101820",
        secondary: "#D3BC8D",
        accent: "#D3BC8D",
    },

    TB: {
        primary: "#D50A0A",
        secondary: "#FF7900",
        accent: "#E52B2F",
    },


    /* =====================================================
       NFC EAST
       ===================================================== */

    DAL: {
        primary: "#041E42",
        secondary: "#869397",

        // Brighter Cowboys blue
        accent: "#4B7DB8",
    },

    NYG: {
        primary: "#0B2265",
        secondary: "#A71930",

        // Brighter Giants blue
        accent: "#3D6FC4",
    },

    PHI: {
        /*
         * Eagles:
         * Keep midnight green underneath,
         * but brighten it enough for dark UI.
         */
        primary: "#004C54",
        secondary: "#A5ACAF",
        accent: "#00A6A6",
    },

    WAS: {
        primary: "#5A1414",
        secondary: "#FFB612",

        // Commanders gold
        accent: "#FFB612",
    },

    // nflverse can sometimes use WSH
    WSH: {
        primary: "#5A1414",
        secondary: "#FFB612",
        accent: "#FFB612",
    },


    /* =====================================================
       AFC WEST
       ===================================================== */

    DEN: {
        /*
         * Broncos should read ORANGE immediately.
         */
        primary: "#002244",
        secondary: "#FB4F14",
        accent: "#FF5A1F",
    },

    KC: {
        primary: "#E31837",
        secondary: "#FFB81C",

        // Chiefs red
        accent: "#F02D48",
    },

    LV: {
        primary: "#000000",
        secondary: "#A5ACAF",

        // Silver instead of disappearing into black
        accent: "#C7CDD1",
    },

    LAC: {
        primary: "#0080C6",
        secondary: "#FFC20E",

        // Chargers powder blue
        accent: "#29A8E8",
    },


    /* =====================================================
       AFC NORTH
       ===================================================== */

    BAL: {
        primary: "#241773",
        secondary: "#9E7C0C",

        // Brighter Ravens purple
        accent: "#8064D8",
    },

    CIN: {
        /*
         * Bengals = orange.
         */
        primary: "#000000",
        secondary: "#FB4F14",
        accent: "#FF5A1F",
    },

    CLE: {
        primary: "#311D00",
        secondary: "#FF3C00",

        // Browns orange
        accent: "#FF4C16",
    },

    PIT: {
        primary: "#101820",
        secondary: "#FFB612",

        // Steelers gold
        accent: "#FFB612",
    },


    /* =====================================================
       AFC SOUTH
       ===================================================== */

    HOU: {
        primary: "#03202F",
        secondary: "#A71930",

        // Texans red instead of dark navy
        accent: "#E32645",
    },

    IND: {
        primary: "#002C5F",
        secondary: "#A2AAAD",

        // Colts blue, lifted for visibility
        accent: "#3D7FC4",
    },

    JAX: {
        primary: "#006778",
        secondary: "#D7A22A",

        // Jaguars teal
        accent: "#00A5B5",
    },

    TEN: {
        primary: "#0C2340",
        secondary: "#4B92DB",

        // Titans light blue
        accent: "#5BA4E6",
    },


    /* =====================================================
       AFC EAST
       ===================================================== */

    BUF: {
        primary: "#00338D",
        secondary: "#C60C30",

        // Bills royal blue
        accent: "#3574D4",
    },

    MIA: {
        primary: "#008E97",
        secondary: "#FC4C02",

        // Dolphins aqua
        accent: "#00B8BF",
    },

    NE: {
        primary: "#002244",
        secondary: "#C60C30",

        /*
         * Patriots:
         * Brighter blue keeps their identity without
         * disappearing into the card background.
         */
        accent: "#477DB5",
    },

    NYJ: {
        primary: "#125740",
        secondary: "#FFFFFF",

        // Jets green
        accent: "#2F9B70",
    },
};


/* =========================================================
   FALLBACK

   Used if a team code isn't recognized.
   ========================================================= */

export const DEFAULT_TEAM_COLORS = {
    primary: "#242933",
    secondary: "#FFFFFF",
    accent: "#FF6500",
};


/* =========================================================
   GET TEAM COLORS
   ========================================================= */

export function getTeamColors(team) {

    const teamCode =
        String(
            team || ""
        )
            .trim()
            .toUpperCase();


    return (
        TEAM_COLORS[teamCode] ||
        DEFAULT_TEAM_COLORS
    );
}


/* =========================================================
   EXPORT
   ========================================================= */

export default TEAM_COLORS;