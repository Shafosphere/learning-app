import React from "react";

// Custom chart component to visualize rank changes over time
export default function MyCustomChart({ ranks = [] }) {
  // If no data, show loading message
  if (ranks.length === 0)
    return <div className="chart-loading">Loading data...</div>;

  const chartWidth = 400;
  const chartHeight = 200;

  // Determine bracket boundaries for the final rank
  const finalRank = ranks[ranks.length - 1] || 1000;
  const bracketSize = 500;
  const bracketLeft = Math.floor(finalRank / bracketSize) * bracketSize;
  const bracketRight = bracketLeft + bracketSize;

  // Calculate offsets relative to the final rank
  const offsets = ranks.map((r) => r - finalRank);
  const minOffset = Math.min(...offsets);
  const maxOffset = Math.max(...offsets);
  const range = maxOffset - minOffset || 1;
  const verticalSpace = 0.8 * chartHeight;
  const scaleFactor = verticalSpace / range;

  const step = 50;
  const midX = chartWidth / 2;
  const midY = chartHeight / 2;

  // Compute coordinates for each rank point
  const pointsWithIndex = offsets
    .map((offset, i) => {
      const x = midX - step * (ranks.length - 1 - i);
      const y = midY - offset * scaleFactor;
      return { x, y, rankIndex: i };
    })
    .filter((pt) => pt.x >= 0);

  const lines = [];
  const segmentColors = [];

  // Create line segments between successive points
  for (let i = 0; i < pointsWithIndex.length - 1; i++) {
    const p1 = pointsWithIndex[i];
    const p2 = pointsWithIndex[i + 1];
    const delta = ranks[p2.rankIndex] - ranks[p1.rankIndex];

    // Dynamic class based on rank change direction
    const lineClass = delta >= 0 ? "line-up" : "line-down";
    segmentColors.push(lineClass);

    lines.push(
      <line
        key={i}
        data-testid="chart-line" // added for tests
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        className={lineClass}
      />
    );
  }

  // Determine circle style based on last segment's direction
  let lastCircleClass = "circle-up";
  if (segmentColors.length > 0) {
    lastCircleClass =
      segmentColors[segmentColors.length - 1] === "line-up"
        ? "circle-up"
        : "circle-down";
  }
  const lastPoint = pointsWithIndex[pointsWithIndex.length - 1];

  return (
    <div className="chart-container">
      <svg width={chartWidth} height={chartHeight} className="my-svg">
        {/* Vertical grid lines in background */}
        {[50, 100, 150, 200, 250, 300, 350].map((xVal) => (
          <line
            key={xVal}
            data-testid="grid-line" // added for tests
            x1={xVal}
            y1={0}
            x2={xVal}
            y2={chartHeight}
            className="chart-grid-line"
          />
        ))}

        {/* Line segments */}
        {lines}

        {/* Circle colored based on the last segment */}
        {lastPoint && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            className={`chart-circle ${lastCircleClass}`}
            data-testid="chart-circle" // added for tests
          />
        )}
      </svg>
    </div>
  );
}
