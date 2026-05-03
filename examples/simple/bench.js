const ITERATIONS = 10000;

// Measure bytes of a small encoded string
const sample = "hello world";
const encoded = new TextEncoder().encode(sample);
const singleSmallBytes = encoded.byteLength;

// Measure encode throughput (ops/s)
const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  new TextEncoder().encode(sample);
}
const elapsed = performance.now() - start;
const encodeOpsPerSec = Math.round(ITERATIONS / (elapsed / 1000));

console.log(
  JSON.stringify({
    project: "example",
    timestamp: new Date().toISOString(),
    benchmarks: [
      {
        name: "single-small",
        group: "size",
        value: singleSmallBytes,
        unit: "bytes",
      },
      {
        name: "encode batch",
        group: "speed",
        value: encodeOpsPerSec,
        unit: "ops/s",
      },
    ],
  }),
);
