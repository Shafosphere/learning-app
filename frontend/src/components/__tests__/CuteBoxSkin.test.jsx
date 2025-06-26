// src/components/__tests__/CuteBoxSkin.test.jsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock gsap before importing component
vi.mock("gsap", () => {
  const timelineMock = {};
  const setMock = vi.fn().mockReturnValue(timelineMock);
  const toMock = vi.fn().mockReturnValue(timelineMock);
  const callMock = vi.fn().mockReturnValue(timelineMock);
  timelineMock.set = setMock;
  timelineMock.to = toMock;
  timelineMock.call = callMock;

  const gsapMock = {
    timeline: vi.fn(() => timelineMock),
    set: vi.fn(),
    utils: {
      selector: vi.fn(
        (container) => (selector) =>
          Array.from(container.querySelectorAll(selector))
      ),
    },
  };
  return { default: gsapMock };
});

import gsap from "gsap";
import CuteBoxSkin from "../maingame/boxex/cutebox";

describe("CuteBoxSkin Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with 'active' or 'notactive' class based on activeBox prop", () => {
    const { rerender } = render(
      <CuteBoxSkin activeBox="a" boxName="a" words={0} />
    );
    const container = screen.getByAltText("topBox").closest("div");
    expect(container).toHaveClass("active");

    rerender(<CuteBoxSkin activeBox="b" boxName="a" words={0} />);
    expect(container).toHaveClass("notactive");
  });

  it("renders correct card images based on the words count", () => {
    const { rerender } = render(
      <CuteBoxSkin activeBox="a" boxName="a" words={0} />
    );
    expect(screen.queryByAltText("flashcard1")).toBeNull();
    expect(screen.queryByAltText("flashcard2")).toBeNull();
    expect(screen.queryByAltText("flashcard3")).toBeNull();

    rerender(<CuteBoxSkin activeBox="a" boxName="a" words={1} />);
    expect(screen.getByAltText("flashcard1")).toBeInTheDocument();

    rerender(<CuteBoxSkin activeBox="a" boxName="a" words={31} />);
    expect(screen.getByAltText("flashcard2")).toBeInTheDocument();

    rerender(<CuteBoxSkin activeBox="a" boxName="a" words={61} />);
    expect(screen.getByAltText("flashcard3")).toBeInTheDocument();
  });

  it("calls gsap.timeline when the component is active", () => {
    render(<CuteBoxSkin activeBox="x" boxName="x" words={5} />);
    expect(gsap.timeline).toHaveBeenCalledTimes(1);
  });

  it("does not call gsap.timeline when the component is not active", () => {
    render(<CuteBoxSkin activeBox="y" boxName="x" words={5} />);
    expect(gsap.timeline).not.toHaveBeenCalled();
  });

  it("calls gsap.set when the component deactivates", () => {
    const { rerender } = render(
      <CuteBoxSkin activeBox="a" boxName="a" words={0} />
    );
    expect(gsap.timeline).toHaveBeenCalledTimes(1);

    rerender(<CuteBoxSkin activeBox="b" boxName="a" words={0} />);
    expect(gsap.set).toHaveBeenCalled();
  });
});
