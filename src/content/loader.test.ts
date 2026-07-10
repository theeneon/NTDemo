import { describe, expect, it } from "vitest";
import { rawDemoContent } from "./data";
import { ContentValidationError, loadGameContent, validateGameContent } from "./loader";

describe("game content loader", () => {
  it("loads, cross-references, and deeply freezes valid content", () => {
    const content = loadGameContent(rawDemoContent);

    expect(content.version).toBe("0.2.0");
    expect(content.ninjas.filter((ninja) => ninja.playable)).toHaveLength(8);
    expect(content.encounters[0]?.enemyTeam).toHaveLength(4);
    expect(Object.isFrozen(content)).toBe(true);
    expect(Object.isFrozen(content.ninjas)).toBe(true);
    expect(Object.isFrozen(content.ninjas[0]?.baseStats)).toBe(true);
  });

  it("rejects duplicate stable IDs with a readable path", () => {
    const result = validateGameContent({
      ...rawDemoContent,
      ninjas: [...rawDemoContent.ninjas, rawDemoContent.ninjas[0]],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues[0]).toEqual(
        expect.objectContaining({
          path: expect.stringMatching(/^ninjas\[\d+\]\.id$/),
          message: expect.stringContaining("Duplicate ID 'ninja.ember'"),
        }),
      );
    }
  });

  it("rejects missing assets and unknown status references", () => {
    const missingAssetResult = validateGameContent({
      ...rawDemoContent,
      assets: rawDemoContent.assets.filter((asset) => asset.id !== "asset.icon-skill-basic-strike"),
    });
    expect(missingAssetResult.success).toBe(false);
    if (!missingAssetResult.success) {
      expect(
        missingAssetResult.issues.some(({ message }) => message.includes("Missing asset")),
      ).toBe(true);
    }

    const firstSkill = rawDemoContent.skills[0]!;
    const missingStatusResult = validateGameContent({
      ...rawDemoContent,
      skills: [
        {
          ...firstSkill,
          effects: [
            {
              kind: "applyStatus",
              target: "self",
              statusId: "status.does-not-exist",
              duration: 1,
              chance: 100,
            },
          ],
        },
        ...rawDemoContent.skills.slice(1),
      ],
    });
    expect(missingStatusResult.success).toBe(false);
    if (!missingStatusResult.success) {
      expect(
        missingStatusResult.issues.some(({ message }) =>
          message.includes("Unknown status 'status.does-not-exist'"),
        ),
      ).toBe(true);
    }
  });

  it("rejects impossible numeric values at schema boundaries", () => {
    const firstNinja = rawDemoContent.ninjas[0]!;
    expect(() =>
      loadGameContent({
        ...rawDemoContent,
        ninjas: [
          { ...firstNinja, baseStats: { ...firstNinja.baseStats, maxHealth: -10 } },
          ...rawDemoContent.ninjas.slice(1),
        ],
      }),
    ).toThrow(ContentValidationError);
  });

  it("rejects encounter prerequisite cycles that make progression unreachable", () => {
    const [borderWatch, bambooPass, ...remainingEncounters] = rawDemoContent.encounters;
    const result = validateGameContent({
      ...rawDemoContent,
      encounters: [
        {
          ...borderWatch!,
          prerequisiteEncounterIds: ["encounter.bamboo-pass"],
        },
        bambooPass!,
        ...remainingEncounters,
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.issues.some(({ message }) => message.includes("prerequisite cycle detected")),
      ).toBe(true);
    }
  });
});
