const EVENT_LABELS = {
  kill: 'Kill',
  death: 'Death',
  loot: 'Loot',
  storm_death: 'Storm Death',
};

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

export const generateInsights = (events, layers) => {
  const insightCards = [];
  const total = events.length;

  const byType = events.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {});

  if (layers.heatmap && total > 0) {
    const density = Math.max(...Object.values(byType));
    const hotType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0];
    insightCards.push({
      title: 'Hot Zone Activity',
      observation: `${EVENT_LABELS[hotType] || hotType} activity dominates current viewport.`,
      evidence: `${density} events out of ${total} are concentrated in the top event class.`,
      action: 'Review geometry and cover placement around these repeated encounter corridors.',
    });
  }

  if (layers.killEvents && (byType.kill || 0) > 0) {
    insightCards.push({
      title: 'Fight Concentration',
      observation: 'Frequent engagements occur in a narrow path network.',
      evidence: `${byType.kill} kill events are visible in selected filters.`,
      action: 'Consider adding alternate flank routes to diversify combat flow.',
    });
  }

  if (layers.deathEvents && (byType.death || 0) > 0) {
    insightCards.push({
      title: 'Death Risk Areas',
      observation: 'Death events appear more often than expected in key transitions.',
      evidence: `${byType.death} player deaths were recorded in this slice.`,
      action: 'Add safer traversal options or soft cover near choke transitions.',
    });
  }

  if (insightCards.length === 0) {
    return [
      {
        title: 'Heatmap Status',
        observation: 'No high-density zones detected in current filter range.',
        evidence: 'Current selections do not produce statistically dominant clusters.',
        action: 'Widen the timeline or include additional layers for broader trend detection.',
      },
    ];
  }

  return insightCards;
};
