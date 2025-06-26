import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SkinSelector from "../maingame/boxex/skinselector";
import { SettingsContext } from "../../pages/settings/properties";
import empty from "../../data/resized_box.png";
import some from "../../data/resized_box_some.png";
import half from "../../data/resized_box_half.png";
import full from "../../data/resized_box_full.png";

// Tests for SkinSelector component, verifying both new and legacy skin rendering
describe("SkinSelector Component", () => {
  // Helper to render the component with a given skinstatus value
  const renderWithSkin = (skinstatus, props) =>
    render(
      <SettingsContext.Provider value={{ skinstatus }}>
        <SkinSelector {...props} />
      </SettingsContext.Provider>
    );

  it("renders CuteBoxSkin when new skin is active (skinstatus=false)", () => {
    renderWithSkin(false, {
      boxName: "testBox",
      activeBox: "testBox",
      boxes: { testBox: [1, 2, 3] },
    });
    // Expect the CuteBoxSkin markup: look for the topBox image
    const topImg = screen.getByAltText("topBox");
    expect(topImg).toBeInTheDocument();
    // Ensure the legacy skin image is not rendered
    expect(screen.queryByAltText("box")).toBeNull();
  });

  describe("Legacy skin rendering (skinstatus=true)", () => {
    const cases = [
      { count: 0, expected: empty },
      { count: 10, expected: some },
      { count: 30, expected: half },
      { count: 60, expected: full },
    ];

    cases.forEach(({ count, expected }) => {
      it(`uses src="${expected}" for box size ${count}`, () => {
        renderWithSkin(true, {
          boxName: "b",
          activeBox: "b",
          boxes: { b: Array(count).fill(null) },
        });
        const img = screen.getByAltText("box");
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute("src", expected);
        expect(img).toHaveClass("active");
      });
    });

    it('applies the "notactive" class when the box is inactive', () => {
      renderWithSkin(true, {
        boxName: "b",
        activeBox: "other",
        boxes: { b: Array(5).fill(null) },
      });
      const img = screen.getByAltText("box");
      expect(img).toHaveClass("notactive");
    });
  });
});
