import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import Card, { CardBody, CardHeader } from '@/Components/ui/Card';
import ChartTooltip from '@/Components/charts/ChartTooltip';

const compact = (v) =>
    new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(v);

export default function BarChartCard({
    title,
    subtitle,
    data,
    xKey = 'month',
    money = true,
    series = [
        { key: 'income', name: 'Pemasukan', color: '#22c55e' },
        { key: 'expense', name: 'Pengeluaran', color: '#ef4444' },
    ],
}) {
    return (
        <Card>
            <CardHeader title={title} subtitle={subtitle} />
            <CardBody>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                className="stroke-gray-200 dark:stroke-gray-700"
                            />
                            <XAxis
                                dataKey={xKey}
                                tick={{ fontSize: 11 }}
                                stroke="currentColor"
                                className="text-gray-500"
                            />
                            <YAxis
                                tickFormatter={money ? compact : undefined}
                                tick={{ fontSize: 11 }}
                                stroke="currentColor"
                                className="text-gray-500"
                            />
                            <Tooltip
                                content={<ChartTooltip money={money} />}
                                cursor={{ fill: 'rgba(148,163,184,0.1)' }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            {series.map((s) => (
                                <Bar
                                    key={s.key}
                                    dataKey={s.key}
                                    name={s.name}
                                    fill={s.color}
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={40}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardBody>
        </Card>
    );
}
