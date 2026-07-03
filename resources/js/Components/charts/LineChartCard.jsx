import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import Card, { CardBody, CardHeader } from '@/Components/ui/Card';
import ChartTooltip from '@/Components/charts/ChartTooltip';
import { formatShortDate } from '@/lib/format';

const compact = (v) =>
    new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(v);

export default function LineChartCard({
    title,
    subtitle,
    data,
    xKey = 'date',
    series = [
        { key: 'expense', name: 'Pengeluaran', color: '#ef4444' },
        { key: 'income', name: 'Pemasukan', color: '#22c55e' },
    ],
    formatX = formatShortDate,
}) {
    return (
        <Card>
            <CardHeader title={title} subtitle={subtitle} />
            <CardBody>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
                            <defs>
                                {series.map((s) => (
                                    <linearGradient
                                        key={s.key}
                                        id={`grad-${s.key}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis
                                dataKey={xKey}
                                tickFormatter={formatX}
                                tick={{ fontSize: 11 }}
                                className="text-gray-500"
                                stroke="currentColor"
                            />
                            <YAxis
                                tickFormatter={compact}
                                tick={{ fontSize: 11 }}
                                stroke="currentColor"
                                className="text-gray-500"
                            />
                            <Tooltip
                                content={<ChartTooltip />}
                                labelFormatter={formatX}
                            />
                            {series.map((s) => (
                                <Area
                                    key={s.key}
                                    type="monotone"
                                    dataKey={s.key}
                                    name={s.name}
                                    stroke={s.color}
                                    strokeWidth={2}
                                    fill={`url(#grad-${s.key})`}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardBody>
        </Card>
    );
}
