import { describe, expect, it } from "vitest";
import { formatGroundingContext, isQueryGrounded } from "./sourceRetrieval";

describe("formatGroundingContext", () => {
  it("returns empty string when no chunks", () => {
    expect(formatGroundingContext([])).toBe("");
  });

  it("labels each chunk as [Source N]", () => {
    const result = formatGroundingContext([
      { text: "Photosynthesis converts light into energy.", score: 0.9 },
      { text: "Plants use chlorophyll.", score: 0.7 },
    ]);
    expect(result).toContain("[Source 1]");
    expect(result).toContain("[Source 2]");
    expect(result).toContain("Photosynthesis");
    expect(result).toContain("chlorophyll");
  });

  it("wraps output in begin/end markers", () => {
    const result = formatGroundingContext([{ text: "foo", score: 0.5 }]);
    expect(result).toContain("SOURCE MATERIAL");
    expect(result).toContain("END SOURCE MATERIAL");
  });
});

describe("isQueryGrounded", () => {
  it("returns false when chunks empty", () => {
    expect(isQueryGrounded([])).toBe(false);
  });

  it("returns true when top score meets threshold", () => {
    expect(isQueryGrounded([{ score: 0.5 }, { score: 0.2 }])).toBe(true);
  });

  it("respects custom threshold", () => {
    expect(isQueryGrounded([{ score: 0.2 }], 0.5)).toBe(false);
    expect(isQueryGrounded([{ score: 0.6 }], 0.5)).toBe(true);
  });

  it("uses default threshold of 0.15", () => {
    expect(isQueryGrounded([{ score: 0.14 }])).toBe(false);
    expect(isQueryGrounded([{ score: 0.16 }])).toBe(true);
  });
});
