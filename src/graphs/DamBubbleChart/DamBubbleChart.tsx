// src/graphs/DamBubbleChart/DamBubbleChart.tsx

import React, { useMemo } from 'react';
import * as d3 from 'd3';
import './DamBubbleChart.scss';

type Dam = {
  dam_id: string;
  dam_name: string;
  capacity: number; // must be a positive number
};

type Props = {
  data: Dam[];
  width?: number;
  height?: number;
};

const COLORS = ['#3b82f6', '#06b6d4']; // blue & turquoise

const DamBubbleChart: React.FC<Props> = ({ data, width = 800, height = 600 }) => {
  // Compute packed layout
  const nodes = useMemo(() => {
    if (!data?.length) return [];

    // Wrap in a hierarchy so d3.pack can work
    const root = d3
      .hierarchy({ children: data } as any)
      .sum((d: any) => d.capacity)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const pack = d3.pack<any>().size([width, height]).padding(6);

    return pack(root).leaves();
  }, [data, width, height]);

  return (
    <div className="dbaWrap">
      <svg
        className="dbaSvg"
        width={width}
        height={height}
        role="img"
        aria-label="Dam capacity bubble chart"
      >
        {nodes.map((node: d3.HierarchyCircularNode<Dam>, i: number) => {
          const dam = node.data as Dam;
          const color = COLORS[i % COLORS.length];

          return (
            <g key={dam.dam_id} transform={`translate(${node.x},${node.y})`}>
              <circle r={node.r} fill={color} opacity={0.8} />
              <text
                textAnchor="middle"
                dy="0.35em"
                className="bubbleLabel"
              >
                {dam.dam_name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default DamBubbleChart;
