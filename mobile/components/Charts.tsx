/**
 * Lightweight bar chart using react-native-svg.
 * No reanimated dependency required.
 */
import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';

interface BarData {
    label: string;
    income: number;
    costs: number;
}

interface Props {
    data: BarData[];
    height?: number;
    width?: number;
}

export function BarChart({ data, height = 200, width = 320 }: Props) {
    if (data.length === 0) return null;

    const paddingLeft = 40;
    const paddingBottom = 30;
    const paddingTop = 10;
    const paddingRight = 10;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingBottom - paddingTop;

    const maxVal = Math.max(...data.flatMap((d) => [d.income, d.costs]), 1);

    const groupWidth = chartWidth / data.length;
    const barWidth = Math.min(groupWidth * 0.35, 18);
    const gap = 4;

    const yTicks = 4;
    const yAxisX = paddingLeft;
    const plotBottom = paddingTop + chartHeight;

    return (
        <Svg width={width} height={height}>
            {/* Y-axis ticks */}
            {Array.from({ length: yTicks + 1 }).map((_, i) => {
                const val = (maxVal / yTicks) * i;
                const y = plotBottom - (val / maxVal) * chartHeight;
                return (
                    <G key={i}>
                        <Line x1={yAxisX} y1={y} x2={yAxisX + chartWidth} y2={y} stroke="#e5e7eb" strokeWidth={1} />
                        <SvgText x={yAxisX - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
                            {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
                        </SvgText>
                    </G>
                );
            })}

            {/* Bars */}
            {data.map((d, i) => {
                const groupX = paddingLeft + i * groupWidth + groupWidth / 2;
                const incomeH = (d.income / maxVal) * chartHeight;
                const costsH = (d.costs / maxVal) * chartHeight;

                return (
                    <G key={i}>
                        {/* Income bar */}
                        <Rect
                            x={groupX - barWidth - gap / 2}
                            y={plotBottom - incomeH}
                            width={barWidth}
                            height={Math.max(incomeH, 2)}
                            fill="#10b981"
                            rx={3}
                        />
                        {/* Costs bar */}
                        <Rect
                            x={groupX + gap / 2}
                            y={plotBottom - costsH}
                            width={barWidth}
                            height={Math.max(costsH, 2)}
                            fill="#f43f5e"
                            rx={3}
                        />
                        {/* X label */}
                        <SvgText
                            x={groupX}
                            y={plotBottom + 16}
                            textAnchor="middle"
                            fontSize={9}
                            fill="#9ca3af"
                        >
                            {d.label}
                        </SvgText>
                    </G>
                );
            })}
        </Svg>
    );
}

/** Lightweight area/line chart using react-native-svg */
interface LinePoint {
    x: number;
    y: number;
}

interface LineChartProps {
    data: LinePoint[];
    height?: number;
    width?: number;
    color?: string;
}

export function LineChart({ data, height = 180, width = 320, color = '#f43f5e' }: LineChartProps) {
    if (data.length === 0) return null;

    const paddingLeft = 40;
    const paddingBottom = 30;
    const paddingTop = 10;
    const paddingRight = 10;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingBottom - paddingTop;

    const maxY = Math.max(...data.map((d) => d.y), 1);
    const minX = Math.min(...data.map((d) => d.x));
    const maxX = Math.max(...data.map((d) => d.x), minX + 1);
    const plotBottom = paddingTop + chartHeight;

    const toScreenX = (x: number) => paddingLeft + ((x - minX) / (maxX - minX)) * chartWidth;
    const toScreenY = (y: number) => plotBottom - (y / maxY) * chartHeight;

    const points = data.map((d) => `${toScreenX(d.x)},${toScreenY(d.y)}`).join(' ');
    const areaPoints = [
        `${toScreenX(data[0].x)},${plotBottom}`,
        points,
        `${toScreenX(data[data.length - 1].x)},${plotBottom}`,
    ].join(' ');

    const yTicks = 4;

    return (
        <Svg width={width} height={height}>
            {/* Y gridlines */}
            {Array.from({ length: yTicks + 1 }).map((_, i) => {
                const val = (maxY / yTicks) * i;
                const y = toScreenY(val);
                return (
                    <G key={i}>
                        <Line x1={paddingLeft} y1={y} x2={paddingLeft + chartWidth} y2={y} stroke="#e5e7eb" strokeWidth={1} />
                        <SvgText x={paddingLeft - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
                            {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
                        </SvgText>
                    </G>
                );
            })}

            {/* Area fill */}
            <Svg>
                <Rect
                    x={0} y={0} width={width} height={height}
                    fill="none"
                />
            </Svg>
            {/* Use polygon for area */}
            <G>
                <Rect
                    x={paddingLeft} y={paddingTop}
                    width={chartWidth} height={chartHeight}
                    fill={`${color}15`}
                    clipPath="none"
                />
            </G>

            {/* Line */}
            {data.length > 1 && (
                <Svg>
                    {data.slice(1).map((d, i) => (
                        <Line
                            key={i}
                            x1={toScreenX(data[i].x)}
                            y1={toScreenY(data[i].y)}
                            x2={toScreenX(d.x)}
                            y2={toScreenY(d.y)}
                            stroke={color}
                            strokeWidth={2}
                        />
                    ))}
                </Svg>
            )}

            {/* X axis ticks (every ~5 days) */}
            {data.filter((_, i) => i % 5 === 0).map((d) => (
                <SvgText
                    key={d.x}
                    x={toScreenX(d.x)}
                    y={plotBottom + 16}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#9ca3af"
                >
                    {d.x}
                </SvgText>
            ))}
        </Svg>
    );
}
