import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { IntlProvider } from "react-intl";
import api from "../../../utils/api";
import ReportDetails from "../../admin/panel-reports/report-details";
import { PopupContext } from "../../popup/popupcontext";

// polyfill <dialog> for JSDOM so ConfirmWindow.showModal works
beforeAll(() => {
  if (typeof window.HTMLDialogElement !== "undefined") {
    HTMLDialogElement.prototype.showModal =
      HTMLDialogElement.prototype.showModal ||
      function () {
        this.setAttribute("open", "");
      };
    HTMLDialogElement.prototype.close =
      HTMLDialogElement.prototype.close ||
      function () {
        this.removeAttribute("open");
      };
  }
});

// mock our api module
vi.mock("../../../utils/api", () => ({
  default: {
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("ReportDetails Component", () => {
  const mockSetPopup = vi.fn();
  const reloadData = vi.fn();

  const Wrapper = ({ children }) => (
    <IntlProvider locale="en" messages={{}}>
      <PopupContext.Provider value={{ setPopup: mockSetPopup }}>
        {children}
      </PopupContext.Provider>
    </IntlProvider>
  );

  const fakeReport = {
    id: 123,
    username: "user1",
    created_at: "2022-01-01T00:00:00.000Z",
    description: "Initial desc",
    report_type: "word_issue",
    translations: [
      {
        id: 1,
        language: "en",
        translation: "hello",
        description: "hi",
        report_id: 123,
      },
      {
        id: 2,
        language: "pl",
        translation: "cześć",
        description: "hej",
        report_id: 123,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    api.post.mockReset();
    api.patch.mockReset();
    api.delete.mockReset();
  });

  it("renders Loading... then fetches and displays report details", async () => {
    api.post.mockResolvedValue({ data: fakeReport });

    render(<ReportDetails reportID={123} reloadData={reloadData} />, {
      wrapper: Wrapper,
    });

    // initial loading state
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // after effect, post should be called
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/report/details", { id: 123 })
    );

    // header & main description
    expect(
      screen.getByRole("heading", { level: 2, name: /Report ID: 123/i })
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Initial desc")).toBeInTheDocument();

    // two translation blocks: each has an <input> and a <textarea>
    const inputs = screen.getAllByRole("textbox");
    // inputs count: 1 main-description + 2 translation-inputs + 2 translation-textareas = 5
    expect(inputs).toHaveLength(5);
  });

  it("updates local state when you type into translation inputs", async () => {
    api.post.mockResolvedValue({ data: fakeReport });

    render(<ReportDetails reportID={123} reloadData={reloadData} />, {
      wrapper: Wrapper,
    });

    await waitFor(() => screen.getByDisplayValue("Initial desc"));

    // find the EN-translation input
    const enInput = screen.getByDisplayValue("hello");
    fireEvent.change(enInput, { target: { value: "hi there" } });
    expect(screen.getByDisplayValue("hi there")).toBeInTheDocument();

    // find the PL-description textarea
    const [, , plDesc] = screen.getAllByRole("textbox");
    // actually this is 3rd textbox, but to be safe find by displayValue:
    const plTextarea = screen.getByDisplayValue("hej");
    fireEvent.change(plTextarea, { target: { value: "cześć!" } });
    expect(screen.getByDisplayValue("cześć!")).toBeInTheDocument();
  });

  it("confirms and runs updateData -> api.patch + positive popup", async () => {
    api.post.mockResolvedValue({ data: fakeReport });
    api.patch.mockResolvedValue({ data: "Updated successfully" });

    render(<ReportDetails reportID={123} reloadData={reloadData} />, {
      wrapper: Wrapper,
    });

    await waitFor(() => screen.getByText(/update changes/i));

    // click the update button
    fireEvent.click(screen.getByText(/update changes/i));
    // confirm dialog appears
    expect(
      screen.getByText(/Are you sure you want to apply these changes\?/i)
    ).toBeInTheDocument();

    // confirm
    fireEvent.click(screen.getByRole("button", { name: /Yes/i }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith("/report/update", {
        report: fakeReport,
      });
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: "Updated successfully",
        emotion: "positive",
      });
    });
  });

  it("shows negative popup on update error", async () => {
    api.post.mockResolvedValue({ data: fakeReport });
    const error = { response: { data: "Server fail" } };
    api.patch.mockRejectedValue(error);

    render(<ReportDetails reportID={123} reloadData={reloadData} />, {
      wrapper: Wrapper,
    });

    await waitFor(() => screen.getByText(/update changes/i));

    fireEvent.click(screen.getByText(/update changes/i));
    fireEvent.click(screen.getByRole("button", { name: /Yes/i }));

    await waitFor(() =>
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: "Server fail",
        emotion: "negative",
      })
    );
  });

  it("confirms and runs deleteData -> api.delete + positive popup + reloadData", async () => {
    api.post.mockResolvedValue({ data: fakeReport });
    api.delete.mockResolvedValue({ data: { message: "Deleted" } });

    render(<ReportDetails reportID={123} reloadData={reloadData} />, {
      wrapper: Wrapper,
    });

    await waitFor(() => screen.getByText(/delete report/i));

    fireEvent.click(screen.getByText(/delete report/i));
    expect(
      screen.getByText(/Do you really want to delete this report\?/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Yes/i }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/report/delete/123");
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: "Deleted",
        emotion: "positive",
      });
      expect(reloadData).toHaveBeenCalled();
    });
  });

  it("shows negative popup on delete error", async () => {
    api.post.mockResolvedValue({ data: fakeReport });
    api.delete.mockRejectedValue(new Error("boom"));

    render(<ReportDetails reportID={123} reloadData={reloadData} />, {
      wrapper: Wrapper,
    });

    await waitFor(() => screen.getByText(/delete report/i));

    fireEvent.click(screen.getByText(/delete report/i));
    fireEvent.click(screen.getByRole("button", { name: /Yes/i }));

    await waitFor(() =>
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: "An error occurred",
        emotion: "negative",
      })
    );
  });
});
