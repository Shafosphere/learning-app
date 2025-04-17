import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Boxes from "../maingame/boxex/boxex";
import { FormattedMessage } from "react-intl";
import MyButton from "../button/button";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock internationalization and button component
vi.mock("react-intl", () => ({
  FormattedMessage: ({ id }) => <span>{id}</span>,
}));

vi.mock("../../button/button", () => ({
  __esModule: true,
  default: ({ message, color, onClick }) => (
    <button onClick={onClick} data-color={color}>
      {typeof message === "string" ? message : message.props.id}
    </button>
  ),
}));

// Mock SkinSelector to bypass context
vi.mock("../maingame/boxex/skinselector", () => ({
  __esModule: true,
  default: () => <div data-testid="skinselector" />,
}));

describe("Boxes Component", () => {
  const boxesData = {
    boxOne: [],
    boxTwo: [1],
    boxThree: [1, 2],
    boxFour: [1, 2, 3],
    boxFive: [1, 2, 3, 4],
  };
  let handleSetBox;
  let addWords;

  beforeEach(() => {
    handleSetBox = vi.fn();
    addWords = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders five boxes with correct counts", () => {
    const { container } = render(
      <Boxes
        boxes={boxesData}
        activeBox="boxThree"
        handleSetBox={handleSetBox}
        addWords={addWords}
      />
    );
    const boxElems = container.getElementsByClassName("box");
    expect(boxElems).toHaveLength(5);
    ["0", "1", "2", "3", "4"].forEach((count) => {
      expect(screen.getByText(count)).toBeInTheDocument();
    });
  });

  it("calls handleSetBox on box click", () => {
    render(
      <Boxes
        boxes={boxesData}
        activeBox="boxOne"
        handleSetBox={handleSetBox}
        addWords={addWords}
      />
    );
    const boxes = screen
      .getAllByText("0")
      .map((textNode) => textNode.closest(".box"));
    fireEvent.click(boxes[0]);
    expect(handleSetBox).toHaveBeenCalledWith("boxOne");
  });

  it("cycles activeBox on ArrowRight and ArrowLeft", () => {
    render(
      <Boxes
        boxes={boxesData}
        activeBox="boxFive"
        handleSetBox={handleSetBox}
        addWords={addWords}
      />
    );
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(handleSetBox).toHaveBeenCalledWith("boxOne");
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(handleSetBox).toHaveBeenCalledWith("boxFour");
  });

  it("calls addWords when enabled via buttons", () => {
    render(
      <Boxes
        boxes={boxesData}
        activeBox="boxOne"
        handleSetBox={handleSetBox}
        addWords={addWords}
      />
    );
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("addWords"));
    expect(addWords).toHaveBeenCalledTimes(2);
  });

  it("does not call addWords when disabled", () => {
    const disabledBoxes = { ...boxesData, boxOne: Array(61).fill(0) };
    render(
      <Boxes
        boxes={disabledBoxes}
        activeBox="boxOne"
        handleSetBox={handleSetBox}
        addWords={addWords}
      />
    );
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("addWords"));
    expect(addWords).not.toHaveBeenCalled();
  });
});
