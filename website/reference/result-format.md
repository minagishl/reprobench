# Benchmark Result Format

Benchmark tasks must write JSON to stdout in the following format. Reprobench captures stdout and saves it to the configured output path.

## Schema

```json
{
  "project": "my-library",
  "timestamp": "2024-01-01T00:00:00Z",
  "benchmarks": [
    {
      "name": "encode single-small",
      "group": "speed",
      "value": 16038,
      "unit": "ops/s"
    },
    {
      "name": "batch-homogeneous-256",
      "group": "size",
      "value": 5316,
      "unit": "bytes"
    }
  ]
}
```

## Fields

### Top-level

| Field         | Type   | Required | Description                    |
| ------------- | ------ | -------- | ------------------------------ |
| `project`     | string | No       | Project name                   |
| `timestamp`   | string | No       | ISO 8601 timestamp             |
| `environment` | object | No       | Arbitrary environment metadata |
| `benchmarks`  | array  | **Yes**  | List of benchmark entries      |

### Benchmark entry

| Field       | Type   | Required | Description                                                     |
| ----------- | ------ | -------- | --------------------------------------------------------------- |
| `name`      | string | **Yes**  | Benchmark name. Must match guard names exactly.                 |
| `group`     | string | No       | Group label used in reports (e.g. `"speed"`, `"size"`)          |
| `value`     | number | **Yes**  | Measured value                                                  |
| `unit`      | string | **Yes**  | Unit of the value                                               |
| `direction` | string | No       | Override direction: `"lower-is-better"` or `"higher-is-better"` |
| `metadata`  | object | No       | Arbitrary extra data                                            |

## Supported units

Direction is inferred from the unit when `direction` is not set:

| Unit          | Inferred direction |
| ------------- | ------------------ |
| `bytes`       | lower-is-better    |
| `ms`          | lower-is-better    |
| `s`           | lower-is-better    |
| `ops/s`       | higher-is-better   |
| `count`       | higher-is-better   |
| _(any other)_ | higher-is-better   |

## Minimal example script (Node.js)

```js
const result = {
  project: "my-library",
  timestamp: new Date().toISOString(),
  benchmarks: [
    {
      name: "encode",
      group: "speed",
      value: measureOpsPerSec(),
      unit: "ops/s",
    },
    {
      name: "output-size",
      group: "size",
      value: measureBytes(),
      unit: "bytes",
    },
  ],
};

process.stdout.write(JSON.stringify(result) + "\n");
```

::: warning
Only write JSON to stdout. Any other output (logs, warnings) must go to stderr, or the result file will fail to parse.
:::
