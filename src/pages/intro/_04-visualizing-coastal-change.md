import StaticChart from '@site/src/components/StaticChart';

export const seaLevelRiseData = [
  { year: 2020, p50: 2.955, p95: 2.955 },
  { year: 2030, p50: 3.010, p95: 3.064 },
  { year: 2040, p50: 3.068, p95: 3.184 },
  { year: 2050, p50: 3.135, p95: 3.330 },
  { year: 2060, p50: 3.195, p95: 3.452 },
  { year: 2070, p50: 3.267, p95: 3.599 },
  { year: 2080, p50: 3.341, p95: 3.760 },
  { year: 2090, p50: 3.411, p95: 3.919 },
  { year: 2100, p50: 3.483, p95: 4.119 },
];

export const seaLevelRiseSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
  title: {
    text: 'Projected Absolute Mean Sea Level',
    subtitle: 'Shaded band spans the 50th to 95th percentile projections',
  },
  data: { values: seaLevelRiseData },
  encoding: {
    x: {
      field: 'year',
      type: 'quantitative',
      title: 'Year',
      axis: { format: 'd', tickMinStep: 10 },
    },
  },
  layer: [
    {
      mark: { type: 'area', interpolate: 'monotone', opacity: 0.2 },
      encoding: {
        y: { field: 'p50', type: 'quantitative', title: 'Meters', scale: { zero: false } },
        y2: { field: 'p95' },
      },
    },
    {
      mark: { type: 'line', interpolate: 'monotone', strokeWidth: 2, point: { size: 70 } },
      encoding: {
        y: { field: 'p50', type: 'quantitative', scale: { zero: false } },
      },
    },
    {
      mark: 'rule',
      params: [
        {
          name: 'hover',
          select: {
            type: 'point',
            fields: ['year'],
            nearest: true,
            on: 'pointerover',
            clear: 'pointerout',
          },
        },
      ],
      encoding: {
        opacity: {
          condition: { param: 'hover', empty: false, value: 0.3 },
          value: 0,
        },
        tooltip: [
          { field: 'year', title: 'Year', type: 'quantitative', format: 'd' },
          { field: 'p50', title: '50th percentile (m)', type: 'quantitative', format: '.3f' },
          { field: 'p95', title: '95th percentile (m)', type: 'quantitative', format: '.3f' },
        ],
      },
    },
  ],
};

## Visualizing Coastal Change

There are different ways to visualize coastal change using observational data. For example, it is possible to measure sea level or land area at different points in time and then plot a curve through those points to track change over time.

<StaticChart spec={seaLevelRiseSpec} height={260} />
