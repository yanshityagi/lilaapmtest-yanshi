// src/data/gameDataAdapter.js (top of file)
import AmbroseImg from '../../player_data/minimaps/AmbroseValley_Minimap.png';
import GrandRiftImg from '../../player_data/minimaps/GrandRift_Minimap.png';
import LockdownImg from '../../player_data/minimaps/Lockdown_Minimap.jpg';

const MAP_CONFIG = {
  ambrose_valley: AmbroseImg,
  grand_rift: GrandRiftImg,
  lockdown: LockdownImg,
};

const EVENT_TYPES = ['kill', 'death', 'loot', 'storm_death'];
const PLAYER_TYPES = ['all', 'solo', 'squad'];
const ACTOR_TYPES = ['human', 'bot'];

const randomRange = (min, max) => Math.random() * (max - min) + min;

const createMockEvents = () => {
  const maps = Object.keys(MAP_CONFIG);
  const matches = ['M-201', 'M-202', 'M-203'];
  const players = ['P-1001', 'P-1002', 'P-1003', 'P-1004', 'P-1005', 'BOT-2001', 'BOT-2002'];
  const start = Date.now() - 1000 * 60 * 30;

  return Array.from({ length: 450 }).map((_, idx) => {
    const playerId = players[idx % players.length];
    const mapName = maps[idx % maps.length];
    const eventType = EVENT_TYPES[idx % EVENT_TYPES.length];
    const timestamp = start + idx * 4000;
    const actorType = playerId.startsWith('BOT') ? 'bot' : ACTOR_TYPES[idx % ACTOR_TYPES.length];

    return {
      player_id: playerId,
      x: randomRange(0.03, 0.97),
      y: randomRange(0.04, 0.96),
      timestamp,
      event_type: eventType,
      player_type: PLAYER_TYPES[(idx % (PLAYER_TYPES.length - 1)) + 1],
      actor_type: actorType,
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
