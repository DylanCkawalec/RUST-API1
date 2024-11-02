import * as pureRand from 'pure-rand';
import type { NextApiRequest, NextApiResponse } from 'next';

interface Data {
  runtime: 'node';
  message: string;
  time: string;
  pi: number;
}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Data>,
): void {
  const t0 = performance.now();
  const seed = Math.floor(Date.now() / 1000);
  const rng = pureRand.mersenne(seed);

  const radius = 424242;
  const loops = 1_000_000;
  let counter = 0;

  for (let i = 0; i < loops; i++) {
    const [nextX, nextRng1] = pureRand.uniformIntDistribution(1, radius, rng);
    const [nextY, nextRng2] = pureRand.uniformIntDistribution(1, radius, nextRng1);

    if (Math.pow(nextX, 2) + Math.pow(nextY, 2) < Math.pow(radius, 2)) {
      counter++;
    }
  }
  const pi = (4.0 * counter) / loops;

  const t1 = performance.now();

  res.status(200).json({
    runtime: 'node',
    message: `${counter} / ${loops}`,
    time: `${(t1 - t0).toFixed(2)} milliseconds`,
    pi,
  });
}
