// Simple PPR fantasy calculator

const DEFAULT_SCORING = {
  ppr: 1, // points per reception
  pass_yd_per_point: 25, // 1 point per 25 pass yards (0.04 per yard)
  rush_rec_yd_per_point: 10, // 1 point per 10 rush/rec yards (0.1 per yard)
  pass_td: 4,
  rush_td: 6,
  rec_td: 6,
  int: -2,
  fumble_lost: -2,
};

export function computeFantasyForGame(stats, scoring = DEFAULT_SCORING) {
  // stats: object with possible keys: passing_yards, pass_yds, passing_tds, pass_td,
  // rushing_yards, rush_yds, rushing_tds, rush_td,
  // receptions, rec, receiving_yards, rec_yds, receiving_tds, rec_td,
  // interceptions, ints, fumbles_lost, fumbles

  const get = (a, b, c) => {
    if (a && a in stats) return Number(stats[a]) || 0;
    if (b && b in stats) return Number(stats[b]) || 0;
    if (c && c in stats) return Number(stats[c]) || 0;
    return 0;
  };

  const passYds = get('passing_yards', 'pass_yds', 'pass_yd');
  const passTds = get('passing_tds', 'pass_td', 'pass_tds');
  const rushYds = get('rushing_yards', 'rush_yds', 'rush_yd');
  const rushTds = get('rushing_tds', 'rush_td', 'rush_tds');
  const rec = get('receptions', 'rec');
  const recYds = get('receiving_yards', 'rec_yds', 'rec_yd');
  const recTds = get('receiving_tds', 'rec_td', 'rec_tds');
  const ints = get('interceptions', 'ints', 'int');
  const fumbles = get('fumbles_lost', 'fumbles', 'fum_lost');

  let pts = 0;
  pts += (passYds / scoring.pass_yd_per_point);
  pts += (rushYds / scoring.rush_rec_yd_per_point);
  pts += (recYds / scoring.rush_rec_yd_per_point);

  pts += passTds * scoring.pass_td;
  pts += rushTds * scoring.rush_td;
  pts += recTds * scoring.rec_td;

  pts += rec * scoring.ppr;

  pts += ints * scoring.int;
  pts += fumbles * scoring.fumble_lost;

  // round to one decimal
  return Math.round(pts * 10) / 10;
}

