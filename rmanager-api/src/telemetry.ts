import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
  AggregationType,
  AggregationOption,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

console.log(
  "[telemetry] module loaded, TELEMETRY_ENABLED:",
  process.env.TELEMETRY_ENABLED,
);
if (process.env.TELEMETRY_ENABLED === "true") {
  console.log("[telemetry] initializing SDK");
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "hono-api",
    [ATTR_SERVICE_VERSION]: "1.0.0",
  });

  // OTel-recommended explicit buckets for HTTP duration (seconds)
  const httpDurationBuckets: AggregationOption = {
    type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
    options: {
      boundaries: [
        0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5,
        10,
      ],
    },
  };

  const sdk = new NodeSDK({
    resource,
    traceExporter: new OTLPTraceExporter(),
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 5000,
      }),
    ],
    views: [
      {
        aggregation: httpDurationBuckets,
        instrumentName: "http.server.request.duration",
      },
      {
        aggregation: httpDurationBuckets,
        instrumentName: "http.client.request.duration",
      },
    ],
    logRecordProcessors: [new BatchLogRecordProcessor(new OTLPLogExporter())],
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
  console.log("[telemetry] SDK started");
}
