// src/graphs/DamBubbleChart/DamBubbleChart.tsx

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import './DamBubbleChart.scss';

type Dam = {
  dam_id: string;
  dam_name: string;
  capacity: number;
};

type Props = {
  data: Dam[];
  width?: number;
  height?: number;
};

// Color scale: smallest to largest, with special color for Hume & Warragamba
const COLORS = [
  '#bfdbfe', // blue-200 - smallest
  '#60a5fa', // blue-400
  '#3b82f6', // blue-500 - medium
  '#2563eb', // blue-600
  '#1e40af', // blue-800 - largest
  '#1d4ed8', // blue-700 - Hume & Warragamba (special)
];

const DamBubbleChart: React.FC<Props> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: 1360, height: 1020 });

  // Track container size and update chart dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width: containerWidth, height: containerHeight } =
          containerRef.current.getBoundingClientRect();

        // Use container dimensions with minimum sizes for usability
        const width = Math.max(300, containerWidth);
        const height = Math.max(300, containerHeight);

        setDimensions({ width, height });
      }
    };

    // Initial measurement
    updateDimensions();

    // Set up ResizeObserver for dynamic resizing
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Reserve space for header (approximately 80px)
  const headerHeight = 80;
  const chartHeight = dimensions.height - headerHeight;

  const nodes = useMemo(() => {
    if (!data?.length) return [];

    const root = d3
      .hierarchy({ children: data } as any)
      .sum((d: any) => d.capacity)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    const pack = d3.pack<any>().size([dimensions.width, chartHeight]).padding(6);

    return pack(root).leaves();
  }, [data, dimensions.width, chartHeight]);

  // Calculate color buckets based on capacity quintiles
  const getColorIndex = useMemo(() => {
    if (!data?.length) return () => 0;

    const capacities = data.map(d => d.capacity).sort((a, b) => a - b);
    const quintiles = [
      capacities[0], // min
      d3.quantile(capacities, 0.2) ?? 0,
      d3.quantile(capacities, 0.4) ?? 0,
      d3.quantile(capacities, 0.6) ?? 0,
      d3.quantile(capacities, 0.8) ?? 0,
      capacities[capacities.length - 1] // max
    ];

    return (capacity: number, damName: string) => {
      // Special bucket for Hume Dam and Warragamba Dam
      if (damName === 'Hume Dam' || damName === 'Warragamba Dam') {
        return 5; // violet color
      }

      // Regular quintile buckets for all other dams
      for (let i = quintiles.length - 1; i >= 0; i--) {
        if (capacity >= quintiles[i]) {
          return Math.min(i, 4); // max index 4 for regular buckets
        }
      }
      return 0;
    };
  }, [data]);

  // Format capacity for display
  const formatCapacity = (capacity: number) => {
    if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(1)}k GL`;
    }
    return `${capacity.toFixed(0)} GL`;
  };

  // Estimate if text will fit in the circle (responsive to screen size)
  const textFitsInCircle = (damName: string, radius: number) => {
    // Adjust character width based on viewport for responsive text sizing
    const baseCharWidth = 7;
    const scaleFactor = Math.min(dimensions.width / 1360, 1);
    const charWidth = baseCharWidth * scaleFactor;
    const textWidth = damName.length * charWidth;

    // Text fits if the diameter can accommodate it with padding
    // Using 1.6 as a safety factor to ensure comfortable fit
    return radius * 2 > textWidth * 1.6;
  };

  // Handle bubble click - navigate to dam detail page
  const handleBubbleClick = (damId: string) => {
    navigate(`/dams/${damId}`);
  };

  return (
    <div className="dbaWrap" ref={containerRef}>
      <div className="dbaHeader">
        <h2 className="dbaTitle">Dam Storage Capacity Overview</h2>
        <p className="dbaSubtitle">Relative comparison of total storage capacity across NSW dams</p>
      </div>
      <div className="dbaChartContainer">
        <svg
          className="dbaSvg"
          width={dimensions.width}
          height={chartHeight}
          viewBox={`0 0 ${dimensions.width} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Dam capacity bubble chart"
        >
          {nodes.map((node: d3.HierarchyCircularNode<Dam>) => {
            const dam = node.data as Dam;
            const colorIndex = getColorIndex(dam.capacity, dam.dam_name);
            const color = COLORS[colorIndex];
            const showLabel = textFitsInCircle(dam.dam_name, node.r);

            return (
              <g
                key={dam.dam_id}
                transform={`translate(${node.x},${node.y})`}
                className="bubbleGroup"
                onClick={() => handleBubbleClick(dam.dam_id)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${dam.dam_name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBubbleClick(dam.dam_id);
                  }
                }}
              >
                <circle r={node.r} fill={color} opacity={0.8} className="bubbleCircle" />
                <text
                  textAnchor="middle"
                  dy="-0.3em"
                  className={`bubbleLabel ${!showLabel ? 'bubbleLabel--hidden' : ''}`}
                >
                  {dam.dam_name}
                </text>
                <text
                  textAnchor="middle"
                  dy="1em"
                  className={`bubbleCapacity ${!showLabel ? 'bubbleCapacity--hidden' : ''}`}
                >
                  {formatCapacity(dam.capacity)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default DamBubbleChart;
