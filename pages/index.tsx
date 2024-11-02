import clsx from 'clsx';
import Head from 'next/head';
import { useState, type ReactElement } from 'react';
import Button from '@/components/button';

interface Data {
  runtime: 'node';
  message: string;
  time: string;
  pi: number;
}

function Card({
  runtime,
  data,
}: {
  runtime: 'Node' | 'Rust';
  data?: Data | null;
}): React.ReactElement {
  return (
    <section className="col-span-5">
      <div
        className={clsx(
          'relative flex h-full w-full p-6 rounded-xl shadow bg-gray-800',
        )}
      >
        <div className="mt-8 flex flex-col space-y-4 ">
          <span className="text-white font-medium">
            <span className="font-bold">Time: </span>
            {data?.time ?? '-'}
          </span>
          <p className="text-white font-medium">
            <span className="font-bold">Points in circle: </span>
            {data?.message ?? '-'}
          </p>
          <p className="text-white font-medium">
            <span className="font-bold">Pi: </span>
            {data?.pi ?? '-'}
          </p>
        </div>

        <div className="absolute inset-x-0 top-0 rounded-t-xl flex items-center justify-between px-4 py-2.5 bg-black/20">
          <div className="flex items-center space-x-2">
            <p className="text-gray-100 select-none text-sm font-medium">
              {runtime}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [resultRust, setResultRust] = useState<Data | null>(null);
  const [resultNode, setResultNode] = useState<Data | null>(null);

  async function fetchRust() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_RUST_API_URL}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count: 1000,
        }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setResultRust(data);
    } catch (error) {
      console.error('Error calling Rust service:', error);
      setResultRust(null);
    }
  }

  async function fetchTS() {
    try {
      const res = await fetch('/api/nodejs', {
        method: 'POST',
        body: JSON.stringify({
          count: 1000,
        }),
      });
      const data = await res.json();
      setResultNode(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleCalculation() {
    try {
      setError(null);
      setResultNode(null);
      setResultRust(null);
      setLoading(true);
      
      await Promise.all([
        fetchTS().catch(e => {
          console.error('Node calculation failed:', e);
          throw new Error('Node calculation failed');
        }),
        fetchRust().catch(e => {
          console.error('Rust calculation failed:', e);
          throw new Error('Rust calculation failed');
        })
      ]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Calculation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Rust Runtime Next.js Example</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full mx-auto max-w-screen-xl px-8 xl:px-4 h-screen-svh flex items-center justify-center">
        <div className="w-full grid grid-cols-5 lg:grid-cols-10 gap-6">
          <Card runtime="Rust" data={resultRust} key="rust-card" />
          <Card runtime="Node" data={resultNode} key="node-card" />
          <div className="col-span-5 order-4 md:order-3 md:col-span-1 lg:col-span-5">
            <Button
              loading={loading}
              onClick={handleCalculation}
            >
              Run - PRNG Algorithm
            </Button>
          </div>

          <div className="order-3 col-span-5 md:order-4 md:col-span-4 lg:col-span-5 px-4 py-2 flex items-center text-white font-medium text-sm bg-gray-800 rounded-md">
            <span className="font-bold">Note:</span>&nbsp;Estimate Pi with Monte
            Carlo Method
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;
