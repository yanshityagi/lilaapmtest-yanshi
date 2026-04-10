const EVENT_LABELS = {
  kill: 'Kill',
  death: 'Death',
  loot: 'Loot',
  storm_death: 'Storm Death',
};

const ZONES = [
  ['North-West', 'North', 'North-East'],
  ['West', 'Center', 'East'],
  ['South-West', 'South', 'South-East'],
];

const getZoneName = (x, y) => {
  const col = Math.min(2, Math.floor(Math.max(0, Math.min(0.999, x)) * 3));
  const row = Math.min(2, Math.floor(Math.max(0, Math.min(0.999, y)) * 3));
  return ZONES[row][col];
};

const toPct = (value) => `${(value * 100).toFixed(0)}%`;

export const formatTimestamp = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

export const groupPathByPlayer = (events) => {
  const grouped = new Map();

  events
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
    .forEach((event) => {
      if (!grouped.has(event.player_id)) {
        grouped.set(event.player_id, []);
      }
      grouped.get(event.player_id).push(event);
    });

  return grouped;
};

export const generateInsights = (events) => {
  if (!events.length) {
    return [
      {
        category: 'Movement',
        observation: 'No events are visible in the current timeline and filter window.',
        evidence: '0 events captured after filters were applied.',
        action: 'Expand timeline range or disable focus mode to recover activity context.',
        score: 1,
      },
    ];
  }

  const total = events.length;
  const byType = events.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {});

  const deaths = byType.death || 0;
  const kills = byType.kill || 0;
  const zoneCounts = events.reduce((acc, event) => {
    const zone = getZoneName(event.x, event.y);
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});

  const deathZoneCounts = events.filter((e) => e.event_type === 'death').reduce((acc, event) => {
    const zone = getZoneName(event.x, event.y);
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});

  const combatHotZone = Object.entries(deathZoneCounts).sort((a, b) => b[1] - a[1])[0];
  const busiestZone = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1])[0];
  const quietZone = Object.entries(zoneCounts).sort((a, b) => a[1] - b[1])[0];

  const botEvents = events.filter((event) => event.actor_type === 'bot');
  const botKills = botEvents.filter((event) => event.event_type === 'kill').length;
  const botDeaths = botEvents.filter((event) => event.event_type === 'death').length;

  const candidates = [];

  if (deaths > 0 && combatHotZone) {
    const ratio = combatHotZone[1] / deaths;
    candidates.push({
      category: 'Combat',
      observation: `High death concentration in ${combatHotZone[0]}.`,
      evidence: `${toPct(ratio)} of all deaths (${combatHotZone[1]}/${deaths}) occur in this zone.`,
      action: 'Add alternate approach lanes or soften cover asymmetry to reduce choke deaths.',
      score: ratio * 100,
    });
  }

  if (busiestZone && quietZone) {
    const busyRatio = busiestZone[1] / total;
    const quietRatio = quietZone[1] / total;
    candidates.push({
      category: 'Movement',
      observation: `Traffic is highly skewed toward ${busiestZone[0]} while ${quietZone[0]} is underused.`,
      evidence: `${toPct(busyRatio)} of movement events are in ${busiestZone[0]} vs ${toPct(quietRatio)} in ${quietZone[0]}.`,
      action: 'Rebalance traversal rewards and visibility to encourage use of low-traffic areas.',
      score: (busyRatio - quietRatio) * 100,
    });
  }

  if (botEvents.length > 0) {
    const botPresence = botEvents.length / total;
    const botKdr = botDeaths === 0 ? botKills : botKills / botDeaths;
    candidates.push({
      category: 'Bot behavior',
      observation: botKdr > 1 ? 'Bots are winning engagements more often than expected.' : 'Bots are being eliminated before influencing fights.',
      evidence: `Bots account for ${toPct(botPresence)} of visible events with K/D ${botKills}/${Math.max(botDeaths, 1)} (${botKdr.toFixed(2)}).`,
      action: botKdr > 1 ? 'Reduce bot aim pressure or improve player cover options in bot-heavy zones.' : 'Improve bot pathing pressure and combat entry timing.',
      score: botPresence * 100 + Math.abs(botKdr - 1) * 20,
    });
  }

  if (kills > 0) {
    const killRate = kills / total;
    candidates.push({
      category: 'Combat',
      observation: 'Engagement density is elevated in current filter range.',
      evidence: `${kills} kill events out of ${total} total events (${toPct(killRate)}).`,
      action: 'Validate whether this combat intensity matches intended pacing for the selected map segment.',
      score: killRate * 70,
    });
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, ...insight }) => insight);
};
