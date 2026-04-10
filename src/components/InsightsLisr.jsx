// InsightsList.jsx (excerpt)
export default function InsightsList({ insights = [], mapApi }) {

    const onHover = (insight, enter) => {
      mapApi?.highlightRegion?.(insight.regionId, enter);
    };
  
    const onClick = (insight) => {
      mapApi?.focusRegion?.(insight.regionId);
      // Optionally dim others: mapApi?.dimOtherRegions?.(insight.regionId)
    };
  
    return (
      <div className="space-y-3">
        {insights.map((item) => (
          <div
            key={item.id}
            onMouseEnter={() => onHover(item, true)}
            onMouseLeave={() => onHover(item, false)}
            onClick={() => onClick(item)}
            className="panel cursor-pointer"
            style={{ padding: '10px' }}
          >
            <div className="font-semibold">{item.title}</div>
            <div className="text-sm text-mutedText">{item.summary}</div>
          </div>
        ))}
      </div>
    );
  }