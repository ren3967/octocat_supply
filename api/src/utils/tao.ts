/**
 * TAO – TypeScript API Observability Framework (local implementation)
 *
 * Provides structured logging, request metrics, and distributed tracing
 * following the TAO interface documented in docs/tao.md.
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import { randomUUID } from 'crypto';

// ── Logging ────────────────────────────────────────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function log(level: LogLevel, message: string, context: Record<string, unknown> = {}): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  // Route warn/error to stderr, everything else to stdout
  if (level === 'warn' || level === 'error') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  debug: (message: string, ctx?: Record<string, unknown>) => log('debug', message, ctx),
  info:  (message: string, ctx?: Record<string, unknown>) => log('info',  message, ctx),
  warn:  (message: string, ctx?: Record<string, unknown>) => log('warn',  message, ctx),
  error: (message: string, ctx?: Record<string, unknown>) => log('error', message, ctx),
};

// ── Metrics ────────────────────────────────────────────────────────────────

interface Counter {
  inc(labels?: Record<string, string>): void;
  value(labels?: Record<string, string>): number;
}

function labelKey(labels: Record<string, string> = {}): string {
  return Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}="${v}"`)
    .join(',');
}

export const MetricRegistry = {
  counter(options: { name: string; labels?: string[] }): Counter {
    const counts = new Map<string, number>();
    return {
      inc(labels: Record<string, string> = {}) {
        const key = labelKey(labels);
        counts.set(key, (counts.get(key) ?? 0) + 1);
        logger.debug(`metric.counter.inc`, { metric: options.name, labels });
      },
      value(labels: Record<string, string> = {}): number {
        return counts.get(labelKey(labels)) ?? 0;
      },
    };
  },
};

// ── Tracing ────────────────────────────────────────────────────────────────

export interface TraceContext {
  traceId: string;
  spanId: string;
}

/**
 * Extract or generate a trace context from W3C traceparent header.
 */
export function getTraceContext(req: Request): TraceContext {
  const traceparent = req.headers['traceparent'];
  if (typeof traceparent === 'string') {
    const parts = traceparent.split('-');
    if (parts.length === 4) {
      return { traceId: parts[1], spanId: parts[2] };
    }
  }
  return { traceId: randomUUID().replace(/-/g, ''), spanId: randomUUID().replace(/-/g, '').slice(0, 16) };
}

// ── observe() middleware ───────────────────────────────────────────────────

const requestCounter = MetricRegistry.counter({
  name: 'api_requests_total',
  labels: ['method', 'path', 'status'],
});

const errorCounter = MetricRegistry.counter({
  name: 'api_errors_total',
  labels: ['method', 'path', 'status'],
});

/**
 * Express middleware that records per-request metrics, structured logs,
 * and attaches a trace context to every request.
 */
export function observe(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    const trace = getTraceContext(req);

    // Attach trace IDs so downstream handlers can reference them
    (req as Request & { trace: TraceContext }).trace = trace;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const labels = {
        method: req.method,
        path: req.route?.path ?? req.path,
        status: String(res.statusCode),
      };

      requestCounter.inc(labels);
      if (res.statusCode >= 400) {
        errorCounter.inc(labels);
      }

      const level: LogLevel = res.statusCode >= 500 ? 'error'
        : res.statusCode >= 400 ? 'warn'
        : 'info';

      log(level, 'request completed', {
        traceId: trace.traceId,
        spanId: trace.spanId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: duration,
      });
    });

    next();
  };
}
