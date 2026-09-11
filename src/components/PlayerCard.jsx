import React from "react";

import { NFL_PLAYERS } from "../data/nflPlayers.js";

import TEAM_COLORS, {
    DEFAULT_TEAM_COLORS,
} from "../data/teamColors.js";

import "./PlayerCard.css";


function PlayerCard({
    player,
    season = 2024,
    selected = false,
    onClick = null,
    assignedWeek = null,
}) {

    if (!player) {
        return null;
    }


    /* =====================================================
       PLAYER SEASON
       ===================================================== */

    const playerSeason =
        Number(
            player.season ||
            player.year ||
            season
        );


    /* =====================================================
       DATABASE LOOKUP

       App.jsx now passes canonical database player objects by
       reference. In that normal path, use the object directly
       instead of re-looking it up on every card render.

       The legacy lookup remains for older / partial player shapes.
       ===================================================== */

    const hasCanonicalData =
        Boolean(
            player.playerId &&
            player.position &&
            player.season &&
            player.weekly
        );


    let databasePlayer =
        hasCanonicalData
            ? player
            : null;


    if (
        !databasePlayer
    ) {
        const seasonDatabase =
            NFL_PLAYERS?.[
            String(
                playerSeason
            )
            ] ||
            NFL_PLAYERS?.[
            playerSeason
            ] ||
            {};


        const playerId =
            player.playerId ||
            player.player_id ||
            "";


        databasePlayer =
            playerId
                ? seasonDatabase[
                playerId
                ] || null
                : null;


        /* =================================================
           FALLBACK LOOKUP BY NAME
           ================================================= */

        if (
            !databasePlayer
        ) {
            const playerName =
                String(
                    player.name ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            databasePlayer =
                Object.values(
                    seasonDatabase
                ).find(
                    (
                        candidate
                    ) =>
                        String(
                            candidate.name ||
                            ""
                        )
                            .trim()
                            .toLowerCase() ===
                        playerName
                ) ||
                null;
        }
    }


    const data =
        databasePlayer ||
        player;


    /* =====================================================
       BASIC PLAYER DATA
       ===================================================== */

    const name =
        data.name ||
        "Unknown Player";


    const position =
        data.position ||
        data.pos ||
        "";


    const team =
        String(
            data.team ||
            "TBD"
        ).toUpperCase();


    const displayedSeason =
        Number(
            data.season ||
            data.year ||
            playerSeason
        );


    const headshot =
        data.headshot ||
        data.headshotUrl ||
        data.headshot_url ||
        "";


    const teamLogo =
        data.teamLogo ||
        data.team_logo ||
        "";


    const averageFantasyPoints =
        Number(
            data.averageFantasyPoints ??
            data.fpts ??
            0
        );


    const byeWeek =
        data.byeWeek ??
        data.bye_week ??
        "--";


    /* =====================================================
       TIER

       NO VISIBLE BADGE.

       Tier only controls the outer
       border / glow / glass treatment.
       ===================================================== */

    const seasonTier =
        String(
            data.seasonTier ||
            "BRONZE"
        )
            .trim()
            .toLowerCase();


    /* =====================================================
       TEAM COLORS
       ===================================================== */

    const teamColors =
        TEAM_COLORS?.[
        team
        ] ||
        DEFAULT_TEAM_COLORS;


    /* =====================================================
       ASSIGNED WEEK
       ===================================================== */

    const weekData =
        assignedWeek !==
            null
            ? (
                data.weekly?.[
                String(assignedWeek)
                ] ||
                data.weekly?.[
                assignedWeek
                ] ||
                null
            )
            : null;


    const opponent =
        weekData?.opponent ||
        null;


    const weekFantasyPoints =
        Number(
            weekData?.fantasyPointsPPR ??
            0
        );


    /* =====================================================
       INITIALS FALLBACK
       ===================================================== */

    const initials =
        name
            .split(" ")
            .filter(Boolean)
            .map(
                (word) =>
                    word[0]
            )
            .join("")
            .slice(
                0,
                2
            )
            .toUpperCase();


    /* =====================================================
       CLASSES
       ===================================================== */

    const className =
        [
            "player-card",

            `player-card-tier-${seasonTier}`,

            selected
                ? "player-card-selected"
                : "",

            onClick
                ? "player-card-clickable"
                : "",
        ]
            .filter(Boolean)
            .join(" ");


    /* =====================================================
       RENDER
       ===================================================== */

    return (

        <div
            className={
                className
            }

            style={{
                "--team-primary":
                    teamColors.primary,

                "--team-secondary":
                    teamColors.secondary,

                "--team-accent":
                    teamColors.accent ||
                    teamColors.primary,
            }}

            onClick={
                onClick ||
                undefined
            }
        >

            {/* =============================================
                SELECTED CHECKMARK
               ============================================= */}

            {selected && (

                <div className="player-card-selected-check">
                    ✓
                </div>

            )}


            {/* =============================================
                TEAM COLOR STRIPE
               ============================================= */}

            <div className="player-card-team-strip" />


            {/* =============================================
                TEAM LOGO
               ============================================= */}

            {teamLogo && (

                <div className="player-card-logo-wrap">

                    <img
                        className="player-card-logo"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"

                        src={
                            teamLogo
                        }

                        alt={`${team} logo`}
                    />

                </div>

            )}


            {/* =============================================
                HEADSHOT
               ============================================= */}

            <div className="player-card-headshot-wrap">

                {headshot ? (

                    <img
                        className="player-card-headshot"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"

                        src={
                            headshot
                        }

                        alt={
                            name
                        }

                        onError={
                            (event) => {

                                event.currentTarget
                                    .style
                                    .display =
                                    "none";


                                const fallback =
                                    event
                                        .currentTarget
                                        .nextElementSibling;


                                if (
                                    fallback
                                ) {

                                    fallback.style.display =
                                        "flex";
                                }
                            }
                        }
                    />

                ) : null}


                <div
                    className="player-card-initials"

                    style={{
                        display:
                            headshot
                                ? "none"
                                : "flex",
                    }}
                >

                    {initials}

                </div>

            </div>


            {/* =============================================
                NAME
               ============================================= */}

            <div className="player-card-name">
                {name}
            </div>


            {/* =============================================
                POSITION / YEAR / TEAM
               ============================================= */}

            <div className="player-card-meta">

                <span>
                    {position}
                </span>

                <span>
                    •
                </span>

                <span>
                    {displayedSeason}
                </span>

                <span>
                    •
                </span>

                <span>
                    {team}
                </span>

            </div>


            {/* =============================================
                NORMAL PLAYER CARD
               ============================================= */}

            {assignedWeek ===
                null ? (

                <div className="player-card-bottom">

                    <div className="player-card-stat-box">

                        <strong className="player-card-fp">

                            {
                                Number.isFinite(
                                    averageFantasyPoints
                                )
                                    ? averageFantasyPoints.toFixed(
                                        1
                                    )
                                    : "--"
                            }

                        </strong>


                        <span>
                            AVG FP
                        </span>

                    </div>


                    <div className="player-card-stat-box">

                        <strong>

                            {
                                byeWeek !==
                                    null &&
                                    byeWeek !==
                                    undefined &&
                                    byeWeek !==
                                    ""
                                    ? byeWeek
                                    : "--"
                            }

                        </strong>


                        <span>
                            BYE WEEK
                        </span>

                    </div>

                </div>

            ) : (

                /* =========================================
                   ROUND / WEEK VERSION
                   ========================================= */

                <div className="player-card-round-bottom">

                    <div className="player-card-matchup">

                        <span>
                            VS
                        </span>


                        <strong>
                            {
                                opponent ||
                                "BYE"
                            }
                        </strong>

                    </div>


                    <div className="player-card-week-points">

                        <strong>

                            {
                                weekFantasyPoints
                                    .toFixed(
                                        1
                                    )
                            }

                        </strong>


                        <span>
                            WEEK FP
                        </span>

                    </div>

                </div>

            )}

        </div>
    );
}


export default React.memo(
    PlayerCard
);
