// src/graphs/DamBarChart/DamBarChart.tsx

import React, { useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';
import './DamBarChart.scss';

type DamBarDatum = {
  dam_id: string;
  dam_name: string;
  capacity: number;
  filled: number;
};

type Props = {
  data?: DamBarDatum[];
};

const BLUE = '#1e3a8a';
const LIGHT_BLUE = '#87CEEB';

const fmtML = (n: number) => `${Math.round(n).toLocaleString()} ML`;

// Custom shape component that renders a full-height clickable overlay
interface FullHeightOverlayProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: {
    dam?: string;
    damId?: string;
  };
  index?: number;
  onClick?: (damId: string) => void;
  onFocusChange?: (index: number | null, isKeyboard: boolean) => void;
}

const FullHeightOverlay: React.FC<FullHeightOverlayProps> = ({
  x = 0,
  width = 0,
  payload,
  index = 0,
  onClick,
  onFocusChange,
}) => {
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const element = groupRef.current;
    if (!element) return;

    // Track whether focus was gained via keyboard
    let isKeyboardFocus = false;

    // Get the chart wrapper for managing hover state
    const chartWrapper = element.closest('.dam-bar-chart-wrap');

    const handleMouseEnter = () => {
      if (!chartWrapper) return;

      // Find all bar cells and update their colors using direct DOM manipulation
      const filledCells = chartWrapper.querySelectorAll('.filled-bar-cell');
      const capacityCells = chartWrapper.querySelectorAll('.capacity-bar-cell');

      filledCells.forEach((cell) => {
        const cellIndex = cell.getAttribute('data-column-index');
        if (cellIndex === String(index)) {
          // Brighten the hovered column
          (cell as SVGElement).style.fill = '#6BB6E6';
        }
      });

      capacityCells.forEach((cell) => {
        const cellIndex = cell.getAttribute('data-column-index');
        if (cellIndex === String(index)) {
          // Brighten the hovered column
          (cell as SVGElement).style.fill = '#2B4FA1';
        }
      });
    };

    const handleMouseLeave = () => {
      if (!chartWrapper) return;

      // Reset all bar cells to their original colors
      const filledCells = chartWrapper.querySelectorAll('.filled-bar-cell');
      const capacityCells = chartWrapper.querySelectorAll('.capacity-bar-cell');

      filledCells.forEach((cell) => {
        (cell as SVGElement).style.fill = '';
      });

      capacityCells.forEach((cell) => {
        (cell as SVGElement).style.fill = '';
      });
    };

    const handleFocus = () => {
      if (isKeyboardFocus) {
        element.classList.add('keyboard-focused');
        if (onFocusChange) onFocusChange(index, true);
      }
      // Also apply hover effect on keyboard focus
      handleMouseEnter();
    };

    const handleBlur = () => {
      element.classList.remove('keyboard-focused');
      isKeyboardFocus = false;
      if (onFocusChange) onFocusChange(null, false);
      // Remove hover effect on blur
      handleMouseLeave();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        isKeyboardFocus = true;
      }
    };

    const handleMouseDown = () => {
      isKeyboardFocus = false;
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);
    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('mousedown', handleMouseDown);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
      element.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('mousedown', handleMouseDown);
    };
  }, [index, onFocusChange]);

  const handleClick = () => {
    if (onClick && payload?.damId) {
      onClick(payload.damId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick && payload?.damId) {
      e.preventDefault();
      onClick(payload.damId);
    }
  };

  // Use the parent chart's coordinate system
  // Make the overlay very tall and start above the chart to ensure full coverage
  const overlayY = -200;
  const overlayHeight = 10000; // Large enough to cover any reasonable chart

  // Expand the overlay width to cover spacing on both sides of the bar
  const spacingPadding = 25; // pixels to add on each side
  const overlayX = x - spacingPadding;
  const overlayWidth = width + (spacingPadding * 2);

  return (
    <g
      ref={groupRef}
      className="column-overlay-group"
      data-column-index={index}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${payload?.dam || 'dam'}`}
    >
      {/* Transparent clickable area that covers the entire column height and width including spacing */}
      <rect
        x={overlayX}
        y={overlayY}
        width={overlayWidth}
        height={overlayHeight}
        fill="transparent"
        className="column-overlay-rect"
        style={{ cursor: 'pointer' }}
      />
      {/* Visual focus indicator (only visible on keyboard focus) */}
      <rect
        x={overlayX - 2}
        y={overlayY}
        width={overlayWidth + 4}
        height={overlayHeight}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        className="column-focus-outline"
        pointerEvents="none"
      />
    </g>
  );
};

const DamBarChart: React.FC<Props> = ({ data = [] }) => {
  const navigate = useNavigate();

  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return [...data]
      .filter((d) => d.capacity > 0)
      .sort((a, b) => a.capacity - b.capacity)
      .map((d, index) => {
        const pct = d.capacity > 0 ? (d.filled / d.capacity) * 100 : 0;
        return {
          dam: d.dam_name,
          damId: d.dam_id,
          capacity: d.capacity,
          filled: d.filled,
          pct,
          pctText: `${pct.toFixed(0)}%`,
          index, // Add index for CSS targeting
        };
      });
  }, [data]);

  // Handle column click - navigate to dam detail page
  const handleColumnClick = (damId: string) => {
    navigate(`/dams/${damId}`);
  };

  const handleFocusChange = React.useCallback(() => {
    // Focus change is handled internally by FullHeightOverlay component
    // This callback is here for future extensibility if needed
  }, []);

  if (!chartData.length) {
    return (
      <div className="dam-bar-chart-wrap">
        <div className="dam-bar-header">
          <h2 className="dam-bar-title">Dam Storage Capacity & Fill Levels</h2>
          <p className="dam-bar-subtitle">Comparison of total capacity and current water storage across NSW dams</p>
        </div>
        <div className="bar-placeholder">No dam data available</div>
      </div>
    );
  }

  return (
    <div className="dam-bar-chart-wrap">
      <div className="dam-bar-header">
        <h2 className="dam-bar-title">Dam Storage Capacity & Fill Levels</h2>
        <p className="dam-bar-subtitle">Comparison of total capacity and current water storage across NSW dams</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
        <CartesianGrid strokeDasharray="3 3" style={{ pointerEvents: 'none' }} />
        <XAxis
          dataKey="dam"
          interval={0}
          angle={-40}
          textAnchor="end"
          height={60}
          style={{ pointerEvents: 'none' }}
        />
        <YAxis
          tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
          label={{ value: 'Volume (ML)', angle: -90, position: 'insideLeft' }}
          style={{ pointerEvents: 'none' }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;
            const data = payload[0].payload;
            return (
              <div className="dbc-tooltip-card">
                <div className="dbc-tooltip-title">Dam: {data.dam}</div>
                <div className="dbc-tooltip-line">
                  <span>Capacity:</span>
                  <span>{fmtML(data.capacity)}</span>
                </div>
                <div className="dbc-tooltip-line">
                  <span>Current Storage:</span>
                  <span>{fmtML(data.filled)}</span>
                </div>
                <div className="dbc-tooltip-line">
                  <span>Fill Level:</span>
                  <span>{data.pctText}</span>
                </div>
              </div>
            );
          }}
        />

        {/* Filled water bar - no pointer events */}
        <Bar
          dataKey="filled"
          name="Current Storage"
          fill={LIGHT_BLUE}
          barSize={40}
          className="filled-bar"
        >
          {chartData.map((entry) => (
            <Cell
              key={`cell-filled-${entry.index}`}
              fill={LIGHT_BLUE}
              data-column-index={entry.index}
              className="filled-bar-cell"
            />
          ))}
        </Bar>

        {/* Capacity bar - no pointer events */}
        <Bar
          dataKey="capacity"
          name="Capacity"
          fill={BLUE}
          barSize={40}
          className="capacity-bar"
        >
          {chartData.map((entry) => (
            <Cell
              key={`cell-capacity-${entry.index}`}
              fill={BLUE}
              data-column-index={entry.index}
              className="capacity-bar-cell"
            />
          ))}
        </Bar>

        {/* Overlay bar with full-height transparent clickable areas */}
        {/* This must be rendered last to be on top */}
        <Bar
          dataKey="capacity"
          barSize={40}
          isAnimationActive={false}
          shape={(props: unknown) => {
            const typedProps = props as FullHeightOverlayProps;
            const index = typedProps.index || 0;
            return (
              <FullHeightOverlay
                {...typedProps}
                index={index}
                onClick={handleColumnClick}
                onFocusChange={handleFocusChange}
              />
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
};

export default DamBarChart;
