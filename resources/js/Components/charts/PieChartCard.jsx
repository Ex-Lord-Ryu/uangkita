import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import Card, { CardBody, CardHeader } from '@/Components/ui/Card';
import ChartTooltip from '@/Components/charts/ChartTooltip';
import { formatRupiah } from '@/lib/format';

export default function PieChartCard({ title, subtitle, data }) {
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <Card>
            <CardHeader title={title} subtitle={subtitle} />
            <CardBody>
                {data.length === 0 ? (
                    <p className="py-12 text-center text-sm text-gray-400">
                        Belum ada data.
                    </p>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        {/* Donut chart — ukuran responsif, tidak melampaui lebar kartu */}
                        <div className="relative w-full max-w-[200px]" style={{ aspectRatio: '1/1' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius="45%"
                                        outerRadius="70%"
                                        paddingAngle={2}
                                        stroke="none"
                                    >
                                        {data.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xs text-gray-400">Total</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                                    {formatRupiah(total)}
                                </span>
                            </div>
                        </div>

                        {/* Legend — selalu di bawah donut, tidak pernah overflow */}
                        <ul className="w-full space-y-2">
                            {data.slice(0, 6).map((entry) => (
                                <li
                                    key={entry.name}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <span
                                        className="h-3 w-3 shrink-0 rounded-full"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="min-w-0 flex-1 truncate text-gray-600 dark:text-gray-300">
                                        {entry.name}
                                    </span>
                                    <span className="shrink-0 font-medium text-gray-800 dark:text-gray-100">
                                        {total > 0
                                            ? Math.round((entry.value / total) * 100)
                                            : 0}
                                        %
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
