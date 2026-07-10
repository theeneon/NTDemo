export type Seed = string | number;

export type SeededRng = Readonly<{
  seed: string;
  next: () => number;
  integer: (minInclusive: number, maxInclusive: number) => number;
  pick: <T>(values: readonly T[]) => T;
  weightedPick: <T>(values: readonly Readonly<{ value: T; weight: number }>[]) => T;
}>;

function hashSeed(seed: string): number {
  let hash = 1_779_033_703 ^ seed.length;
  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3_432_918_353);
    hash = (hash << 13) | (hash >>> 19);
  }
  hash = Math.imul(hash ^ (hash >>> 16), 2_246_822_507);
  hash = Math.imul(hash ^ (hash >>> 13), 3_266_489_909);
  return (hash ^= hash >>> 16) >>> 0;
}

export function createSeededRng(inputSeed: Seed): SeededRng {
  const seed = String(inputSeed);
  let state = hashSeed(seed);

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };

  return {
    seed,
    next,
    integer(minInclusive, maxInclusive) {
      if (!Number.isInteger(minInclusive) || !Number.isInteger(maxInclusive)) {
        throw new TypeError("Seeded integer bounds must be integers");
      }
      if (maxInclusive < minInclusive) {
        throw new RangeError("Seeded integer maximum must be greater than or equal to minimum");
      }
      return Math.floor(next() * (maxInclusive - minInclusive + 1)) + minInclusive;
    },
    pick<T>(values: readonly T[]) {
      if (!values.length) throw new RangeError("Cannot pick from an empty collection");
      return values[Math.floor(next() * values.length)]!;
    },
    weightedPick<T>(values: readonly Readonly<{ value: T; weight: number }>[]) {
      if (!values.length) throw new RangeError("Cannot pick from an empty weighted collection");
      if (values.some(({ weight }) => !Number.isFinite(weight) || weight <= 0)) {
        throw new RangeError("Every weighted value must have a finite positive weight");
      }
      const totalWeight = values.reduce((total, { weight }) => total + weight, 0);
      const roll = next() * totalWeight;
      let cursor = 0;
      for (const entry of values) {
        cursor += entry.weight;
        if (roll < cursor) return entry.value;
      }
      return values.at(-1)!.value;
    },
  };
}
