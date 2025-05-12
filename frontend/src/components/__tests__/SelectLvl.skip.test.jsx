import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import SelectLvl from "../selectlvl/selectlvl";

// Mock FormattedMessage for displaying ID
vi.mock("react-intl", () => ({
  FormattedMessage: ({ id }) => (
    <span data-testid="formatted-message">{id}</span>
  ),
}));

describe("SelectLvl Component", () => {
  const mockSetDisplay = vi.fn();
  const defaultLevels = [
    { value: "B2", messageKey: "levelB2" },
    { value: "C1", messageKey: "levelC1" },
  ];

  const customLevels = [
    { value: "A1", messageKey: "levelA1", icon: "🎮" },
    { value: "A2", messageKey: "levelA2", icon: "🌟" },
  ];

  const renderComponent = (props = {}) =>
    render(
      <SelectLvl setDisplay={mockSetDisplay} gametype="default" {...props} />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render default levels B2 and C1", () => {
    renderComponent();
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("default.levelB2");
    expect(buttons[1]).toHaveTextContent("default.levelC1");
  });

  it("should display custom levels passed via props", () => {
    renderComponent({ levels: customLevels });
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("default.levelA1");
    expect(buttons[1]).toHaveTextContent("default.levelA2");
  });

  it("should display only icons when onlyIcons=true", () => {
    renderComponent({ levels: customLevels, onlyIcons: true });
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent("🎮");
    expect(buttons[0]).not.toHaveTextContent("levelA1");
    expect(buttons[1]).toHaveTextContent("🌟");
    expect(buttons[1]).not.toHaveTextContent("levelA2");
  });

  it("should call setDisplay with correct value on click", () => {
    renderComponent({ levels: customLevels });
    fireEvent.click(screen.getByText("default.levelA1"));
    expect(mockSetDisplay).toHaveBeenCalledWith("A1");
  });

  it("should use correct message IDs for different gametype", () => {
    renderComponent({ gametype: "vocab" });
    expect(screen.getByText("vocab.chooseLevel")).toBeInTheDocument();
    expect(screen.getByText("vocab.gametype")).toBeInTheDocument();
    expect(screen.getByText("vocab.chooseTest")).toBeInTheDocument();
  });

  it("should render correct DOM structure", () => {
    const { container } = renderComponent();
    expect(container.querySelector(".select-container")).toBeInTheDocument();
    expect(container.querySelector(".select-window")).toBeInTheDocument();
    expect(container.querySelector("h1")).toHaveTextContent(
      "default.chooseLevel"
    );
    expect(container.querySelector("p")).toHaveTextContent(
      "default.chooseTest"
    );
  });
});
