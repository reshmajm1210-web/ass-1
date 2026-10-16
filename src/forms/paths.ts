/**
 * Tiny immutable path helpers.
 *
 * The form keeps one `values` object in state. Every edit goes through
 * `setPath` / `appendRow` / `removeRow`, which clone only the branches along
 * the changed path — so React sees a new object at the root, and nothing
 * else is touched. Paths are the same dot strings used as validation error
 * keys (`invoices.0.items.1.quantity`), which keeps state and validation in
 * one vocabulary.
 */

type Container = Record<string, unknown> | unknown[]

function isIndex(segment: string): boolean {
  return /^\d+$/.test(segment)
}

function readPath(source: unknown, segments: string[]): unknown {
  let current: unknown = source
  for (const segment of segments) {
    if (current === null || current === undefined) return undefined
    const container = current as Record<string | number, unknown>
    current = container[isIndex(segment) ? Number(segment) : segment]
  }
  return current
}

export function getPath<T = unknown>(source: unknown, path: string): T | undefined {
  return readPath(source, path.split('.')) as T | undefined
}

/** Clone one container (object or array) so the original stays untouched. */
function cloneContainer(node: unknown, segment: string): Container {
  if (Array.isArray(node)) return node.slice()
  if (segment !== undefined && isIndex(segment)) {
    // Path addresses an array index but the node is missing/not an array yet.
    return Array.isArray(node) ? node.slice() : []
  }
  return { ...(node as Record<string, unknown> | undefined) }
}

function writePath(node: unknown, segments: string[], value: unknown): Container {
  const [head, ...rest] = segments
  const copy = cloneContainer(node, head)
  if (Array.isArray(copy)) {
    copy[Number(head)] = rest.length === 0 ? value : writePath(copy[Number(head)], rest, value)
    return copy
  }
  copy[head] = rest.length === 0 ? value : writePath(copy[head], rest, value)
  return copy
}

/** Return a copy of `source` with `path` set to `value`. */
export function setPath<T>(source: T, path: string, value: unknown): T {
  return writePath(source, path.split('.'), value) as T
}

/** Read the array at `path` (empty array when absent). */
export function getRows<T>(source: unknown, path: string): T[] {
  const rows = getPath<unknown>(source, path)
  return Array.isArray(rows) ? (rows as T[]) : []
}

/** Append a row to the array at `path`. */
export function appendRow<T>(source: T, path: string, row: unknown): T {
  return setPath(source, path, [...getRows(source, path), row])
}

/** Remove the row at `path.index`; out-of-range indexes are a no-op. */
export function removeRow<T>(source: T, path: string, index: number): T {
  const rows = getRows(source, path)
  if (index < 0 || index >= rows.length) return source
  return setPath(
    source,
    path,
    rows.filter((_, rowIndex) => rowIndex !== index)
  )
}

/** Replace the row at `path.index` using an updater. */
export function updateRow<T>(source: T, path: string, index: number, updater: (row: unknown) => unknown): T {
  return setPath(source, `${path}.${index}`, updater(getRows(source, path)[index]))
}

/** Look up the message for a dotted error path (undefined when valid). */
export function errorAt(errors: Record<string, string>, path: string): string | undefined {
  return errors[path]
}
