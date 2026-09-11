#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const BASE_RAW = 'https://raw.githubusercontent.com/guga31bb/nflfastR-data/master/data/player_stats/player_stats_';
const outDir = path.resolve('.', 'data', 'nflfastR');
const seasons = [2023,2024,2025,2026];

async function fetchSeason(season){
  const url = `${BASE_RAW}${season}.csv`;
  console.log('Fetching', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const outPath = path.join(outDir, `player_stats_${season}.csv`);
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outPath, text, 'utf-8');
  console.log('Saved', outPath);
}

async function main(){
  for (const s of seasons){
    try{ await fetchSeason(s); }catch(e){ console.error('Failed', s, e.message); }
  }
}

main().catch(e=>{ console.error(e); process.exit(1); });
