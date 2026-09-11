
import React from "react";
import PlayerCard from "./PlayerCard.jsx";
import "../styles/app.css";
import "./HallofFame.css";

function HallOfFame({ runs = [], onClear = null }) {
    return (
        <section className="hall-of-fame">
            {runs.length === 0 ? (
                <div className="hall-empty">
                    <p>No runs saved yet. Finish a Gauntlet run to see it here.</p>
                </div>
            ) : (
                <div className="hall-grid">
                    {runs.slice().reverse().map((run, idx) => (
                        <article className="hof-card" key={idx}>
                            <header className="hof-card-header">
                                <div className="hof-stats">
                                    <strong className="hof-wins">{run.wins} WINS</strong>
                                    <span className="hof-round">Round {run.roundReached}</span>
                                </div>

                                <div className={`hof-badge ${run.champion ? "champion" : "eliminated"}`}>
                                    {run.champion ? "COMPLETED" : "ELIMINATED"}
                                </div>
                            </header>

                            <div className="hof-roster-scroll">
                                {run.roster.map((p, pi) => (
                                    <div className="hof-player-wrap" key={pi}>
                                        <PlayerCard
                                            player={{ name: p.name, season: p.year || p.season }}
                                            season={p.year || p.season}
                                        />
                                    </div>
                                ))}
                            </div>

                            {run.perks && run.perks.length > 0 && (
                                <div className="hof-perks">
                                    {run.perks.map((perk, k) => (
                                        <span key={k} className="hof-perk">{perk.name}</span>
                                    ))}
                                </div>
                            )}

                            {run.note && (
                                <div className="hof-note">{run.note}</div>
                            )}
                        </article>
                    ))}
                </div>
            )}

            <div className="hall-actions">
                <button
                    className="info-primary-button"
                    onClick={() => {
                        if (onClear) onClear();
                    }}
                >
                    CLEAR HALL OF FAME
                </button>
            </div>
        </section>
    );
}

export default HallOfFame;
