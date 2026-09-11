import React from "react";

import "./PerkCard.css";


function PerkCard({
    perk,
    selected = false,
    onClick = null,
}) {
    if (
        !perk
    ) {
        return null;
    }


    const {
        icon = "★",
        label,
        name,
        description,
        badge = "",
        rarity = "",
    } = perk;


    const title =
        label ||
        name ||
        "Perk";


    const normalizedRarity =
        String(
            rarity ||
            ""
        )
            .trim()
            .toUpperCase();


    const isLegendary =
        normalizedRarity ===
        "LEGENDARY";


    const isRare =
        normalizedRarity ===
        "RARE";


    /*
     * Second Wind:
     *
     * badge = RARE
     * rarity = LEGENDARY
     *
     * So it keeps the RARE label,
     * but gets Legendary gold styling.
     */
    const displayBadge =
        badge ||
        (
            isLegendary
                ? "LEGENDARY"
                : isRare
                    ? "RARE"
                    : ""
        );


    const classNames = [
        "perk-card",

        selected
            ? "perk-card-selected"
            : "",

        onClick
            ? "perk-card-clickable"
            : "",

        isLegendary
            ? "perk-card-legendary"
            : "",

        isRare
            ? "perk-card-rare"
            : "",
    ]
        .filter(
            Boolean
        )
        .join(
            " "
        );


    return (
        <button
            type="button"
            className={
                classNames
            }
            onClick={
                onClick
            }
            disabled={
                !onClick
            }
        >

            {/* =============================================
                RARITY BADGE
               ============================================= */}

            {displayBadge && (
                <div className="perk-card-level">
                    {displayBadge}
                </div>
            )}


            {/* =============================================
                ICON
               ============================================= */}

            <div className="perk-card-icon">
                {icon}
            </div>


            {/* =============================================
                NAME
               ============================================= */}

            <h3 className="perk-card-title">
                {title}
            </h3>


            {/* =============================================
                DESCRIPTION
               ============================================= */}

            <p className="perk-card-description">
                {description}
            </p>


            {/* =============================================
                SELECT BUTTON TEXT
               ============================================= */}

            <div className="perk-card-footer">
                {selected
                    ? "SELECTED ✓"
                    : "SELECT"}
            </div>

        </button>
    );
}


export default PerkCard;