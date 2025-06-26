// src/components/__tests__/Flashcard.test.jsx

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Flashcard from "../maingame/card/flashcard";
import { IntlProvider } from "react-intl";

// Centralized test suite for the Flashcard component

describe("Flashcard Component", () => {
  let defaultData;
  let props;

  beforeEach(() => {
    vi.useFakeTimers();
    defaultData = {
      id: "abc123",
      wordEng: { word: "english", description: "Eng desc" },
      wordPl: { word: "polish", description: "Pl desc" },
    };
    props = {
      data: defaultData,
      check: vi.fn(),
      className: "",
      cssClasses: { notDisplay: "", notDisplayReverse: "", notVisible: "" },
      activeBox: "boxOne",
      handleSetWordFlash: vi.fn(),
      handleSetwordId: vi.fn(),
      changeCorrectStatus: vi.fn(),
      correctWordRef: { current: null },
      correctSecondWordRef: { current: null },
      userWordRef: { current: null },
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  const renderComponent = (overrides = {}) => {
    const merged = { ...props, ...overrides };
    return render(
      <IntlProvider
        locale="en"
        messages={{ submit: "Submit", firstLetter: "First Letter" }}
      >
        <Flashcard {...merged} />
      </IntlProvider>
    );
  };

  it("calls handleSetWordFlash and handleSetwordId and sets placeholders based on activeBox", () => {
    renderComponent({ activeBox: "boxTwo" });

    expect(props.handleSetWordFlash).toHaveBeenCalledWith("english");
    expect(props.handleSetwordId).toHaveBeenCalledWith("abc123");

    const customInputs = document.querySelectorAll(
      "input.custom-input-flashcard"
    );
    expect(customInputs).toHaveLength(2);
    const placeholders = Array.from(customInputs).map((input) =>
      input.nextElementSibling.textContent.trim()
    );
    expect(placeholders).toEqual(["english", "polish"]);
  });

  it("switches words when activeBox is not boxTwo or boxFour", () => {
    renderComponent({ activeBox: "boxOne" });

    expect(props.handleSetWordFlash).toHaveBeenCalledWith("polish");
    expect(props.handleSetwordId).toHaveBeenCalledWith("abc123");

    const customInputs = document.querySelectorAll(
      "input.custom-input-flashcard"
    );
    const placeholders = Array.from(customInputs).map((input) =>
      input.nextElementSibling.textContent.trim()
    );
    expect(placeholders).toEqual(["polish", "english"]);
  });

  it("updates the normal input value and calls check on Submit click", () => {
    renderComponent();
    const normalInput = document.querySelector("input.flashcard-input-normal");

    fireEvent.change(normalInput, { target: { value: "trial" } });
    expect(normalInput.value).toBe("trial");

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(props.check).toHaveBeenCalledWith(
      "trial",
      expect.any(String),
      "abc123"
    );
  });

  it("calls check when Enter key is pressed in normal input", () => {
    renderComponent();
    const normalInput = document.querySelector("input.flashcard-input-normal");

    fireEvent.change(normalInput, { target: { value: "abc" } });
    act(() => fireEvent.keyDown(normalInput, { key: "Enter", code: "Enter" }));
    expect(props.check).toHaveBeenCalledWith(
      "abc",
      expect.any(String),
      "abc123"
    );
  });

  it("shows the first letter hint when the button is clicked", () => {
    renderComponent();
    expect(screen.queryByText("p")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /first letter/i }));
    expect(screen.getByText("p")).toBeInTheDocument();
  });

  it("calculates the --wordLength style correctly for the normal input", () => {
    const customData = {
      id: "1",
      wordEng: { word: "mix", description: "" },
      wordPl: { word: "pl", description: "" },
    };
    renderComponent({ data: customData, activeBox: "boxOne" });

    const normalInput = document.querySelector("input.flashcard-input-normal");
    const length = parseFloat(
      normalInput.style.getPropertyValue("--wordLength")
    );
    expect(length).toBe(customData.wordEng.word.length * 0.5);
  });

  it("navigates focus with ArrowDown and ArrowUp keys", () => {
    renderComponent();
    const customInputs = document.querySelectorAll(
      "input.custom-input-flashcard"
    );
    const normalInput = document.querySelector("input.flashcard-input-normal");

    props.correctWordRef.current = customInputs[0];
    props.correctSecondWordRef.current = customInputs[1];
    props.userWordRef.current = normalInput;

    act(() => customInputs[0].focus());
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(document.activeElement).toBe(customInputs[1]);
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(document.activeElement).toBe(normalInput);
    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(document.activeElement).toBe(customInputs[1]);
    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(document.activeElement).toBe(customInputs[0]);
  });

  it("moves focus to correctWordRef when notVisible becomes visible", () => {
    renderComponent({
      cssClasses: { ...props.cssClasses, notVisible: "visible" },
    });
    const customInputs = document.querySelectorAll(
      "input.custom-input-flashcard"
    );
    props.correctWordRef.current = customInputs[0];
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(document.activeElement).toBe(customInputs[0]);
  });

  it("resets the normal input value when data.id changes", () => {
    const { rerender } = renderComponent();
    const normalInput = document.querySelector("input.flashcard-input-normal");
    fireEvent.change(normalInput, { target: { value: "xyz" } });
    expect(normalInput.value).toBe("xyz");

    rerender(
      <IntlProvider
        locale="en"
        messages={{ submit: "Submit", firstLetter: "First Letter" }}
      >
        <Flashcard {...props} data={{ ...defaultData, id: "newId" }} />
      </IntlProvider>
    );
    expect(normalInput.value).toBe("");
  });
});
