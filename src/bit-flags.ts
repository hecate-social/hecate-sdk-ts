/**
 * Bit flag manipulation for aggregate state management.
 *
 * TypeScript port of evoq_bit_flags (Erlang).
 *
 * Bit flags are particularly useful in event-sourced systems where aggregate
 * state can be represented as a set of flags (finite state machine).
 *
 * Flag values must be powers of 2 to occupy unique bit positions:
 *
 * ```ts
 * const INSTALLED  = 1;   // 0b00000001
 * const REMOVED    = 2;   // 0b00000010
 * const RUNNING    = 4;   // 0b00000100
 * const STOPPED    = 8;   // 0b00001000
 * const ACTIVATED  = 256; // 0b100000000
 * ```
 *
 * Inspired by C# Flags enum attribute.
 *
 * @module
 */

/** An integer used as a bitset (any non-negative integer, including 0). */
export type Flags = number;

/** A single power-of-2 integer (1, 2, 4, 8, 16, ...). */
export type Flag = number;

/**
 * Maps flag values (powers of 2) to human-readable descriptions.
 *
 * Key 0 is optional — used when all flags are unset.
 *
 * ```ts
 * const PLG_FLAG_MAP: FlagMap = {
 *   0:   "None",
 *   1:   "Installed",
 *   2:   "Removed",
 *   4:   "Running",
 *   256: "Activated",
 * };
 * ```
 */
export type FlagMap = Record<number, string>;

// =============================================================================
// Core Operations
// =============================================================================

/** Sets a flag using bitwise OR. */
export function set(target: Flags, flag: Flag): Flags {
  return (target | flag) >>> 0;
}

/** Unsets a flag using bitwise AND with NOT. */
export function unset(target: Flags, flag: Flag): Flags {
  return (target & ~flag) >>> 0;
}

/** Sets multiple flags. */
export function setAll(target: Flags, flags: Flag[]): Flags {
  let result = target;
  for (const flag of flags) {
    result = result | flag;
  }
  return result >>> 0;
}

/** Unsets multiple flags. */
export function unsetAll(target: Flags, flags: Flag[]): Flags {
  let result = target;
  for (const flag of flags) {
    result = result & ~flag;
  }
  return result >>> 0;
}

// =============================================================================
// Query Operations
// =============================================================================

/** Returns true if the flag is set. */
export function has(target: Flags, flag: Flag): boolean {
  return (target & flag) === flag;
}

/** Returns true if the flag is NOT set. */
export function hasNot(target: Flags, flag: Flag): boolean {
  return (target & flag) !== flag;
}

/** Returns true if ALL flags are set. */
export function hasAll(target: Flags, flags: Flag[]): boolean {
  return flags.every((flag) => has(target, flag));
}

/** Returns true if ANY flag is set. */
export function hasAny(target: Flags, flags: Flag[]): boolean {
  return flags.some((flag) => has(target, flag));
}

// =============================================================================
// Conversion Operations
// =============================================================================

/**
 * Returns descriptions of all set flags.
 *
 * ```ts
 * toList(261, { 1: "Installed", 4: "Running", 256: "Activated" })
 * // => ["Installed", "Running", "Activated"]
 * ```
 */
export function toList(target: Flags, flagMap: FlagMap): string[] {
  if (target === 0) {
    const zeroDesc = flagMap[0];
    return zeroDesc !== undefined ? [zeroDesc] : [];
  }

  const keys = Object.keys(flagMap)
    .map(Number)
    .filter((k) => k > 0)
    .sort((a, b) => a - b);

  const result: string[] = [];
  for (const key of keys) {
    if ((target & key) !== 0) {
      result.push(flagMap[key]);
    }
  }
  return result;
}

/**
 * Returns a string of flag descriptions joined by separator.
 *
 * ```ts
 * toString(261, flagMap)         // "Installed, Running, Activated"
 * toString(261, flagMap, " | ")  // "Installed | Running | Activated"
 * ```
 */
export function toString(
  target: Flags,
  flagMap: FlagMap,
  separator: string = ", ",
): string {
  return toList(target, flagMap).join(separator);
}

/**
 * Decomposes an integer into its power-of-2 components.
 *
 * ```ts
 * decompose(261)  // [1, 4, 256]
 * decompose(15)   // [1, 2, 4, 8]
 * decompose(0)    // []
 * ```
 */
export function decompose(target: Flags): Flag[] {
  if (target <= 0) return [];

  const result: Flag[] = [];
  let power = 1;
  while (power <= target) {
    if ((target & power) !== 0) {
      result.push(power);
    }
    power = power << 1;
  }
  return result;
}

// =============================================================================
// Analysis Operations
// =============================================================================

/** Returns the description of the highest set flag, or undefined. */
export function highest(target: Flags, flagMap: FlagMap): string | undefined {
  const list = toList(target, flagMap);
  return list.length > 0 ? list[list.length - 1] : undefined;
}

/** Returns the description of the lowest set flag, or undefined. */
export function lowest(target: Flags, flagMap: FlagMap): string | undefined {
  const list = toList(target, flagMap);
  return list.length > 0 ? list[0] : undefined;
}
