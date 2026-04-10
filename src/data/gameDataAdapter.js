const MAP_CONFIG = {
  ambrose_valley: '/maps/ambrose_valley.png',
  grand_rift: '/maps/grand_rift.png',
  lockdown: '/maps/lockdown.jpg',
};

const EVENT_TYPES = ['kill', 'death', 'loot', 'storm_death'];
const PLAYER_TYPES = ['all', 'solo', 'squad'];

const randomRange = (min, max) => Math.random() * (max - min) + min;

const createMockEvents = () => {
  const maps = Object.keys(MAP_CONFIG);
  const matches = ['M-201', 'M-202', 'M-203'];
  const players = ['P-1001', 'P-1002', 'P-1003', 'P-1004', 'P-1005'];
  const start = Date.now() - 1000 * 60 * 30;

  return Array.from({ length: 450 }).map((_, idx) => {
    const mapName = maps[idx % maps.length];
    const eventType = EVENT_TYPES[idx % EVENT_TYPES.length];
    const timestamp = start + idx * 4000;
    return {
      player_id: players[idx % players.length],
      x: randomRange(0.03, 0.97),
      y: randomRange(0.04, 0.96),
      timestamp,
      event_type: eventType,
      player_type: PLAYER_TYPES[(idx % (PLAYER_TYPES.length - 1)) + 1],
      match_id: matches[idx % matches.length],
      map_name: mapName,
    };
  });
};

export const getGameData = async () => {
  const events = createMockEvents();
  return {
    events,
    mapConfig: MAP_CONFIG,
  };
};

export { MAP_CONFIG };
