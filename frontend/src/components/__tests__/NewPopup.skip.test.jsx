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
  // Fake timers
  vi.useFakeTimers();

  // Mock Audio, tak by play() zwracało Promise.resolve()
  audioInstances = [];
  playMock = vi.fn(() => Promise.resolve());
  global.Audio = vi.fn().mockImplementation((src) => {
    const instance = { src, play: playMock, volume: 1 };
    audioInstances.push(instance);
    return instance;
  });

  // Stub createPortal
  vi.spyOn(ReactDOM, "createPortal").mockImplementation((node) => node);

  // Portal-root w DOM
  document.body.innerHTML = '<div id="portal-root"></div>';
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("NewPopup", () => {
  const renderWithContext = (props, contextValue) =>
    render(
      <IntlProvider locale="en">
        <SettingsContext.Provider value={contextValue}>
          <NewPopup {...props} />
        </SettingsContext.Provider>
      </IntlProvider>
    );

  it("wyświetla przekazany message gdy nie jest kodem błędu", () => {
    renderWithContext(
      {
        message: "Cześć!",
        emotion: "default",
        duration: 2000,
        onClose: () => {},
      },
      { isSoundEnabled: "false" }
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Cześć!");
  });

  it('renderuje <FormattedMessage /> gdy message zaczyna się od "ERR_"', () => {
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

  it("dobiera odpowiedni kolor tła według emotion", () => {
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

  it("ukrywa popup po upływie duration i wywołuje onClose po dodatkowych 250 ms", () => {
    const onClose = vi.fn();
    renderWithContext(
      { message: "Test", emotion: "default", duration: 3000, onClose },
      { isSoundEnabled: "false" }
    );
    const alert = screen.getByRole("alert");

    // początkowo ma klasę show
    expect(alert).toHaveClass(styles.show);

    // po duration
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(alert).toHaveClass(styles.hide);

    // po dodatkowych 250 ms
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('odtwarza odpowiedni dźwięk gdy isSoundEnabled="true"', () => {
    renderWithContext(
      {
        message: "Test",
        emotion: "negative",
        duration: 1000,
        onClose: () => {},
      },
      { isSoundEnabled: "true" }
    );
    // Trzy instancje Audio (positive, negative, warning)
    expect(audioInstances).toHaveLength(3);
    // dla "negative" to druga instancja (indeks 1)
    expect(audioInstances[1].volume).toBe(0.4);
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('nie odtwarza dźwięku gdy isSoundEnabled="false"', () => {
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

  it("renderuje w portal-root", () => {
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
