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
/** Sets a flag using bitwise OR. */
export declare function set(target: Flags, flag: Flag): Flags;
/** Unsets a flag using bitwise AND with NOT. */
export declare function unset(target: Flags, flag: Flag): Flags;
/** Sets multiple flags. */
export declare function setAll(target: Flags, flags: Flag[]): Flags;
/** Unsets multiple flags. */
export declare function unsetAll(target: Flags, flags: Flag[]): Flags;
/** Returns true if the flag is set. */
export declare function has(target: Flags, flag: Flag): boolean;
/** Returns true if the flag is NOT set. */
export declare function hasNot(target: Flags, flag: Flag): boolean;
/** Returns true if ALL flags are set. */
export declare function hasAll(target: Flags, flags: Flag[]): boolean;
/** Returns true if ANY flag is set. */
export declare function hasAny(target: Flags, flags: Flag[]): boolean;
/**
 * Returns descriptions of all set flags.
 *
 * ```ts
 * toList(261, { 1: "Installed", 4: "Running", 256: "Activated" })
 * // => ["Installed", "Running", "Activated"]
 * ```
 */
export declare function toList(target: Flags, flagMap: FlagMap): string[];
/**
 * Returns a string of flag descriptions joined by separator.
 *
 * ```ts
 * toString(261, flagMap)         // "Installed, Running, Activated"
 * toString(261, flagMap, " | ")  // "Installed | Running | Activated"
 * ```
 */
export declare function toString(target: Flags, flagMap: FlagMap, separator?: string): string;
/**
 * Decomposes an integer into its power-of-2 components.
 *
 * ```ts
 * decompose(261)  // [1, 4, 256]
 * decompose(15)   // [1, 2, 4, 8]
 * decompose(0)    // []
 * ```
 */
export declare function decompose(target: Flags): Flag[];
/** Returns the description of the highest set flag, or undefined. */
export declare function highest(target: Flags, flagMap: FlagMap): string | undefined;
/** Returns the description of the lowest set flag, or undefined. */
export declare function lowest(target: Flags, flagMap: FlagMap): string | undefined;
//# sourceMappingURL=bit-flags.d.ts.map