import { useEffect, useState } from "react";
import PlayerCard from "./PlayerCard.jsx";
import { getRandomWeekForPlayer } from "../api/nflApi.js";

// WeekCard shows a randomized week variant for a player (from nflfastR data when available)
// supports draft (left-click) and bench (right-click).
export default function WeekCard({ player, onDraft }) {
    const [variant, setVariant] = useState(null);

    useEffect(() => {
        let mounted = true;
        async function load() {
            // try to fetch a real week for this player's season
            const wk = await getRandomWeekForPlayer(player);
            if (!mounted) return;
            if (wk) {
                setVariant({
                    name: player.name,
                    year: wk.season,
                    team: wk.team || player.team,
                    pos: player.pos,
                    yards: wk.stats?.rushing_yards || wk.stats?.receiving_yards || wk.stats?.passing_yards || player.yards,
                    tds: wk.stats?.rushing_tds || wk.stats?.receiving_tds || wk.stats?.passing_tds || player.tds,
                    turnovers: wk.stats?.interceptions || wk.stats?.fumbles_lost || player.turnovers,
                    fpts: wk.fpts || player.fpts,
                    week: wk.week,
                });
            } else {
                // fallback to weak random variant so older players still selectable
                const variability = Math.random() * 0.45 + 0.6; // 0.6 - 1.05
                setVariant({
                    ...player,
                    fpts: Math.max(0, Math.round((player.fpts || 10) * variability)),
                    yards: Math.max(0, Math.round((player.yards || 50) * variability)),
                    tds: Math.max(0, Math.round((player.tds || 0) * variability)),
                });
            }
        }
        load();
        return () => { mounted = false; };
    }, [player]);

    const handleClick = (e) => {
        e.preventDefault();
        if (onDraft && variant) onDraft(variant, false);
    };

    const handleContext = (e) => {
        e.preventDefault();
        if (onDraft && variant) onDraft(variant, true);
    };

    return (
        <div onClick={handleClick} onContextMenu={handleContext}>
            {variant ? <PlayerCard player={variant} draggable={true} dragData={{type:'pool',player:variant}} /> : <PlayerCard player={player} draggable={true} dragData={{type:'pool',player}} />}
        </div>
    );
}
