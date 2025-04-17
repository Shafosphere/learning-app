import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import ConfirmWindow from "../confirm/confirm";

describe("ConfirmWindow Component", () => {
  const originalShowModal = HTMLDialogElement.prototype.showModal;
  const originalClose = HTMLDialogElement.prototype.close;

  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  afterEach(() => {
    cleanup();
    HTMLDialogElement.prototype.showModal = originalShowModal;
    HTMLDialogElement.prototype.close = originalClose;
    vi.resetAllMocks();
  });

  it("calls showModal on mount", () => {
    render(
      <IntlProvider locale="en">
        <ConfirmWindow message="Test message" onClose={vi.fn()} />
      </IntlProvider>
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  it("renders regular confirmation when no conflict and handles Close", () => {
    const onClose = vi.fn();
    render(
      <IntlProvider locale="en">
        <ConfirmWindow message="Proceed?" onClose={onClose} />
      </IntlProvider>
    );

    // Message
    expect(screen.getByText("Proceed?")).toBeInTheDocument();

    // Buttons
    const noBtn = screen.getByRole("button", { name: /No/i, hidden: true });
    const yesBtn = screen.getByRole("button", { name: /Yes/i, hidden: true });

    fireEvent.click(noBtn);
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(false);

    fireEvent.click(yesBtn);
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it("renders conflict confirmation and displays dates and handles Close", () => {
    const onClose = vi.fn();
    const localDate = "2025-04-01";
    const serverDate = "2025-03-20";

    render(
      <IntlProvider locale="en">
        <ConfirmWindow
          conflict={true}
          localDate={localDate}
          serverDate={serverDate}
          onClose={onClose}
        />
      </IntlProvider>
    );

    // Title and dates
    expect(screen.getByText(/Different save versions/i)).toBeInTheDocument();
    expect(screen.getByText(localDate)).toBeInTheDocument();
    expect(screen.getByText(serverDate)).toBeInTheDocument();

    // Buttons
    const yesBtn = screen.getByRole("button", { name: /Yes/i, hidden: true });
    const noBtn = screen.getByRole("button", { name: /No/i, hidden: true });

    fireEvent.click(yesBtn);
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(true);

    fireEvent.click(noBtn);
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalledWith(false);
  });
});
