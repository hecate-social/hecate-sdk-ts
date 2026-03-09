import { describe, it, expect } from "vitest";
import {
  set,
  unset,
  setAll,
  unsetAll,
  has,
  hasNot,
  hasAll,
  hasAny,
  toList,
  toString,
  decompose,
  highest,
  lowest,
  type FlagMap,
} from "./bit-flags.js";

// -- Test flag definitions (mirroring plugin_status.hrl) --

const PLG_INSTALLED = 1;
const PLG_REMOVED = 2;
const PLG_RUNNING = 4;
const PLG_STOPPED = 8;
const PLG_CONFIRMED_UP = 16;
const PLG_CONFIRMED_DOWN = 32;
const PLG_PULLING = 64;
const PLG_EXTRACTING = 128;
const PLG_ACTIVATED = 256;
const PLG_DEACTIVATED = 512;

const PLG_FLAG_MAP: FlagMap = {
  0: "None",
  [PLG_INSTALLED]: "Installed",
  [PLG_REMOVED]: "Removed",
  [PLG_RUNNING]: "Running",
  [PLG_STOPPED]: "Stopped",
  [PLG_CONFIRMED_UP]: "Confirmed Up",
  [PLG_CONFIRMED_DOWN]: "Confirmed Down",
  [PLG_PULLING]: "Pulling",
  [PLG_EXTRACTING]: "Extracting",
  [PLG_ACTIVATED]: "Activated",
  [PLG_DEACTIVATED]: "Deactivated",
};

// -- Core Operations --

describe("set", () => {
  it("sets a flag on zero", () => {
    expect(set(0, PLG_INSTALLED)).toBe(1);
  });

  it("sets a flag using bitwise OR", () => {
    expect(set(36, 64)).toBe(100);
  });

  it("is idempotent", () => {
    const s = set(0, PLG_INSTALLED);
    expect(set(s, PLG_INSTALLED)).toBe(s);
  });

  it("sets multiple flags independently", () => {
    let s = set(0, PLG_INSTALLED);
    s = set(s, PLG_ACTIVATED);
    expect(s).toBe(PLG_INSTALLED | PLG_ACTIVATED); // 257
  });
});

describe("unset", () => {
  it("clears a flag using bitwise AND NOT", () => {
    expect(unset(100, 64)).toBe(36);
  });

  it("is a no-op if flag is not set", () => {
    expect(unset(PLG_INSTALLED, PLG_RUNNING)).toBe(PLG_INSTALLED);
  });

  it("clears the only flag to zero", () => {
    expect(unset(PLG_INSTALLED, PLG_INSTALLED)).toBe(0);
  });
});

describe("setAll", () => {
  it("sets multiple flags at once", () => {
    expect(setAll(36, [64, 128])).toBe(228);
  });

  it("handles empty list", () => {
    expect(setAll(42, [])).toBe(42);
  });
});

describe("unsetAll", () => {
  it("clears multiple flags at once", () => {
    expect(unsetAll(228, [64, 128])).toBe(36);
  });

  it("handles empty list", () => {
    expect(unsetAll(42, [])).toBe(42);
  });
});

// -- Query Operations --

describe("has", () => {
  it("returns true when flag is set", () => {
    expect(has(100, 64)).toBe(true);
  });

  it("returns false when flag is not set", () => {
    expect(has(100, 8)).toBe(false);
  });

  it("checks plugin status 261 = INSTALLED | RUNNING | ACTIVATED", () => {
    const status = PLG_INSTALLED | PLG_RUNNING | PLG_ACTIVATED; // 261
    expect(has(status, PLG_INSTALLED)).toBe(true);
    expect(has(status, PLG_RUNNING)).toBe(true);
    expect(has(status, PLG_ACTIVATED)).toBe(true);
    expect(has(status, PLG_STOPPED)).toBe(false);
    expect(has(status, PLG_REMOVED)).toBe(false);
  });
});

describe("hasNot", () => {
  it("returns false when flag is set", () => {
    expect(hasNot(100, 64)).toBe(false);
  });

  it("returns true when flag is not set", () => {
    expect(hasNot(100, 8)).toBe(true);
  });
});

describe("hasAll", () => {
  it("returns true when all flags are set", () => {
    expect(hasAll(100, [4, 32, 64])).toBe(true);
  });

  it("returns false when some flags are missing", () => {
    expect(hasAll(100, [4, 8])).toBe(false);
  });

  it("returns true for empty list", () => {
    expect(hasAll(0, [])).toBe(true);
  });
});

describe("hasAny", () => {
  it("returns true when any flag is set", () => {
    expect(hasAny(100, [8, 64])).toBe(true);
  });

  it("returns false when no flags are set", () => {
    expect(hasAny(100, [1, 2, 8])).toBe(false);
  });

  it("returns false for empty list", () => {
    expect(hasAny(100, [])).toBe(false);
  });
});

// -- Conversion Operations --

describe("toList", () => {
  it("returns descriptions of set flags", () => {
    const map: FlagMap = { 4: "Completed", 32: "Archived", 64: "Ready" };
    expect(toList(100, map)).toEqual(["Completed", "Archived", "Ready"]);
  });

  it("returns zero description when target is 0 and map has key 0", () => {
    expect(toList(0, PLG_FLAG_MAP)).toEqual(["None"]);
  });

  it("returns empty array when target is 0 and no key 0", () => {
    expect(toList(0, { 1: "One" })).toEqual([]);
  });

  it("decodes plugin status 261", () => {
    const status = PLG_INSTALLED | PLG_RUNNING | PLG_ACTIVATED; // 261
    expect(toList(status, PLG_FLAG_MAP)).toEqual([
      "Installed",
      "Running",
      "Activated",
    ]);
  });

  it("skips flags not in the map", () => {
    const sparse: FlagMap = { 1: "Installed", 256: "Activated" };
    expect(toList(261, sparse)).toEqual(["Installed", "Activated"]);
  });
});

describe("toString", () => {
  it("joins with default comma separator", () => {
    expect(toString(261, PLG_FLAG_MAP)).toBe("Installed, Running, Activated");
  });

  it("joins with custom separator", () => {
    expect(toString(261, PLG_FLAG_MAP, " | ")).toBe(
      "Installed | Running | Activated",
    );
  });

  it("returns empty string for zero with no zero key", () => {
    expect(toString(0, { 1: "One" })).toBe("");
  });
});

describe("decompose", () => {
  it("decomposes into power-of-2 components", () => {
    expect(decompose(100)).toEqual([4, 32, 64]);
  });

  it("decomposes 15 into [1, 2, 4, 8]", () => {
    expect(decompose(15)).toEqual([1, 2, 4, 8]);
  });

  it("decomposes plugin status 261", () => {
    expect(decompose(261)).toEqual([1, 4, 256]);
  });

  it("returns empty for zero", () => {
    expect(decompose(0)).toEqual([]);
  });

  it("handles single flag", () => {
    expect(decompose(256)).toEqual([256]);
  });
});

// -- Analysis Operations --

describe("highest", () => {
  it("returns the description of the highest set flag", () => {
    expect(highest(261, PLG_FLAG_MAP)).toBe("Activated");
  });

  it("returns undefined for zero with no zero key", () => {
    expect(highest(0, { 1: "One" })).toBeUndefined();
  });

  it("returns zero description for zero with zero key", () => {
    expect(highest(0, PLG_FLAG_MAP)).toBe("None");
  });
});

describe("lowest", () => {
  it("returns the description of the lowest set flag", () => {
    expect(lowest(261, PLG_FLAG_MAP)).toBe("Installed");
  });

  it("returns undefined for zero with no zero key", () => {
    expect(lowest(0, { 1: "One" })).toBeUndefined();
  });
});

// -- Lifecycle Simulation --

describe("plugin lifecycle simulation", () => {
  it("models the full in-VM plugin lifecycle", () => {
    let status = 0;

    // Install
    status = set(status, PLG_INSTALLED);
    expect(status).toBe(1);
    expect(toList(status, PLG_FLAG_MAP)).toEqual(["Installed"]);

    // Activate
    status = set(status, PLG_ACTIVATED);
    expect(status).toBe(257);
    expect(has(status, PLG_INSTALLED)).toBe(true);
    expect(has(status, PLG_ACTIVATED)).toBe(true);
    expect(toList(status, PLG_FLAG_MAP)).toEqual(["Installed", "Activated"]);

    // Deactivate (set DEACTIVATED, clear ACTIVATED)
    status = unset(set(status, PLG_DEACTIVATED), PLG_ACTIVATED);
    expect(has(status, PLG_DEACTIVATED)).toBe(true);
    expect(has(status, PLG_ACTIVATED)).toBe(false);
    expect(toList(status, PLG_FLAG_MAP)).toEqual([
      "Installed",
      "Deactivated",
    ]);
  });

  it("models the container plugin lifecycle", () => {
    let status = 0;

    // Install
    status = set(status, PLG_INSTALLED);

    // Start OCI pull
    status = set(status, PLG_PULLING);
    expect(toList(status, PLG_FLAG_MAP)).toEqual(["Installed", "Pulling"]);

    // Complete pull
    status = unset(status, PLG_PULLING);

    // Start execution
    status = set(status, PLG_RUNNING);
    expect(toList(status, PLG_FLAG_MAP)).toEqual(["Installed", "Running"]);

    // Container confirmed up
    status = set(status, PLG_CONFIRMED_UP);
    expect(toList(status, PLG_FLAG_MAP)).toEqual([
      "Installed",
      "Running",
      "Confirmed Up",
    ]);

    // Container goes down
    status = unset(set(status, PLG_CONFIRMED_DOWN), PLG_CONFIRMED_UP);
    expect(has(status, PLG_CONFIRMED_DOWN)).toBe(true);
    expect(has(status, PLG_CONFIRMED_UP)).toBe(false);
  });
});
