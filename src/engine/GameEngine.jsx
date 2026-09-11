// Simple roguelike round simulation for demo
// Exports simulateRound(roster, round) -> { score, opponentScore, win, events, opponent }

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

function applyBonuses(player, roster) {
    let base = player.fpts || 0;

    // chemistry: same team & same year (stack) -> +2
    roster.forEach(teammate => {
        if (teammate !== player && teammate.team === player.team && teammate.year === player.year) {
            base += 2;
        }
    });

    // positional synergies
    if (player.pos === "QB") {
        roster.forEach(teammate => {
            if (["WR", "TE"].includes(teammate.pos) && teammate.team === player.team) base += 1;
        });
    }
    if (player.pos === "RB") {
        // team synergy small
        roster.forEach(teammate => {
            if (teammate.team === player.team) base += 0.5;
        });
    }

    // reward big weeks
    if ((player.yards || 0) >= 100) base += 1;
    if ((player.tds || 0) >= 2) base += 1;

    return base;
}

function generateOpponentRoster(playerPool, round) {
    // tiers by round
    let minVar = 0.85, maxVar = 1.05;
    if (round >= 3 && round <= 4) { minVar = 0.95; maxVar = 1.25; }
    if (round >= 5 && round <= 6) { minVar = 1.15; maxVar = 1.6; }
    if (round >= 7) { minVar = 1.6; maxVar = 2.2; }

    const pool = [...playerPool];
    const opponent = [];

    for (let i = 0; i < 5; i++) {
        if (pool.length === 0) break;
        const idx = Math.floor(Math.random() * pool.length);
        const base = pool.splice(idx, 1)[0];
        const clone = { ...base };
        const variability = randRange(minVar, maxVar);
        clone.fpts = Math.max(0, Math.round((clone.fpts || 10) * variability));
        clone.yards = Math.round((clone.yards || 50) * variability);
        clone.tds = Math.max(0, Math.round((clone.tds || 0) * variability));

        // final round: mark HOF-level boosts
        if (round >= 7) {
            clone.fpts = Math.round(clone.fpts * 1.4 + 20);
        }

        opponent.push(clone);
    }

    return opponent;
}


// Generate an opponent lineup for a given round (exported)
export function generateOpponent(playerPool, round) {
    return generateOpponentRoster(playerPool, round);
}

// Compute deterministic score for a roster (no chaos)
export function computeScore(roster) {
    let score = 0;
    roster.forEach(player => {
        score += applyBonuses(player, roster);
    });
    return Math.round(score);
}

// Backwards-compatible simulateRound: generates opponent and returns full result
export function simulateRound(roster, round, playerPool) {
    const opponent = generateOpponent(playerPool, round);
    const score = computeScore(roster);
    const opponentScore = computeScore(opponent) * (1 + (round - 1) * 0.12) * (round >= 7 ? 1.6 : 1);
    const win = score > opponentScore;
    return {
        score: Math.round(score),
        opponentScore: Math.round(opponentScore),
        win,
        opponent,
    };
}
