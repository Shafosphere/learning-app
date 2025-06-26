// src/components/__tests__/NewPopup.test.jsx

import React from "react";
import ReactDOM from "react-dom";
import { render, screen, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import NewPopup from "../popup/newpopup";
import { SettingsContext } from "../../pages/settings/properties";
import { IntlProvider } from "react-intl";
import styles from "../popup/popup.module.css";

let audioInstances;
let playMock;

beforeEach(() => {
  // Use fake timers for timing-related tests
  vi.useFakeTimers();

  // Mock Audio so that play() returns a resolved Promise
  audioInstances = [];
  playMock = vi.fn(() => Promise.resolve());
  global.Audio = vi.fn().mockImplementation((src) => {
    const instance = { src, play: playMock, volume: 1 };
    audioInstances.push(instance);
    return instance;
  });

  // Stub ReactDOM.createPortal to return the node directly
  vi.spyOn(ReactDOM, "createPortal").mockImplementation((node) => node);

  // Add portal-root element to document body
  document.body.innerHTML = '<div id="portal-root"></div>';
});

afterEach(() => {
  // Restore real timers and mocks
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("NewPopup Component", () => {
  const renderWithContext = (props, contextValue) =>
    render(
      <IntlProvider locale="en">
        <SettingsContext.Provider value={contextValue}>
          <NewPopup {...props} />
        </SettingsContext.Provider>
      </IntlProvider>
    );

  it("displays the provided message when it is not an error code", () => {
    renderWithContext(
      {
        message: "Hello!",
        emotion: "default",
        duration: 2000,
        onClose: () => {},
      },
      { isSoundEnabled: "false" }
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Hello!");
  });

  it("renders <FormattedMessage /> when the message starts with 'ERR_'", () => {
    renderWithContext(
      {
        message: "ERR_TEST",
        emotion: "warning",
        duration: 2000,
        onClose: () => {},
      },
      { isSoundEnabled: "false" }
    );
    expect(screen.getByText("Unknown error")).toBeInTheDocument();
  });

  it("applies the correct background color based on emotion", () => {
    renderWithContext(
      {
        message: "Test",
        emotion: "positive",
        duration: 2000,
        onClose: () => {},
      },
      { isSoundEnabled: "false" }
    );
    expect(screen.getByRole("alert")).toHaveStyle({
      backgroundColor: "var(--highlight)",
    });
  });

  it("hides the popup after duration and calls onClose after an additional 250ms", () => {
    const onClose = vi.fn();
    renderWithContext(
      { message: "Test", emotion: "default", duration: 3000, onClose },
      { isSoundEnabled: "false" }
    );
    const alert = screen.getByRole("alert");

    // Initially it should have the "show" class
    expect(alert).toHaveClass(styles.show);

    // After the duration has elapsed
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(alert).toHaveClass(styles.hide);

    // After an additional 250ms
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("plays the correct sound when isSoundEnabled='true'", () => {
    renderWithContext(
      {
        message: "Test",
        emotion: "negative",
        duration: 1000,
        onClose: () => {},
      },
      { isSoundEnabled: "true" }
    );
    // Three Audio instances are created (default, negative, warning)
    expect(audioInstances).toHaveLength(3);
    // The second instance corresponds to "negative"
    expect(audioInstances[1].volume).toBe(0.4);
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it("does not play sound when isSoundEnabled='false'", () => {
    renderWithContext(
      {
        message: "Test",
        emotion: "positive",
        duration: 1000,
        onClose: () => {},
      },
      { isSoundEnabled: "false" }
    );
    expect(playMock).not.toHaveBeenCalled();
  });

  it("renders into the portal-root element", () => {
    const portalSpy = vi.spyOn(ReactDOM, "createPortal");
    renderWithContext(
      { message: "X", emotion: "default", duration: 1000, onClose: () => {} },
      { isSoundEnabled: "false" }
    );
    expect(portalSpy).toHaveBeenCalledWith(
      expect.any(Object),
      document.getElementById("portal-root")
    );
  });
});
