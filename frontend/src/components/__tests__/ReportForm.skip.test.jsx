import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ReportForm from "../report/report";
import { IntlProvider } from "react-intl";
import { PopupContext } from "../popup/popupcontext";
import api from "../../utils/api";

// Mock translations
const messages = {
  "reportForm.success": "Report received",
  "reportForm.error": "An error occurred",
  "reportForm.reportType": "Report Type:",
  "reportForm.typeOther": "Other",
  "reportForm.typeWordIssue": "Word Issue",
  "reportForm.word": "Word:",
  "reportForm.description": "Description:",
  "reportForm.submitButton": "Submit Report",
};

// Mock API
vi.mock("../../utils/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockSetPopup = vi.fn();

const Wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={messages}>
    <PopupContext.Provider value={{ setPopup: mockSetPopup }}>
      {children}
    </PopupContext.Provider>
  </IntlProvider>
);

describe("ReportForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.post.mockReset();
  });

  const renderComponent = () => render(<ReportForm />, { wrapper: Wrapper });

  it("should render the form correctly", () => {
    renderComponent();

    expect(screen.getByLabelText("Report Type:")).toBeInTheDocument();
    expect(screen.getByLabelText("Description:")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit Report" })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Word:")).not.toBeInTheDocument();
  });

  it("should display the Word field when 'word_issue' is selected", () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText("Report Type:"), {
      target: { value: "word_issue" },
    });

    expect(screen.getByLabelText("Word:")).toBeInTheDocument();
  });

  it("should submit the form with correct data", async () => {
    api.post.mockResolvedValue({ data: { success: true } });
    renderComponent();

    fireEvent.change(screen.getByLabelText("Report Type:"), {
      target: { value: "word_issue" },
    });
    fireEvent.change(screen.getByLabelText("Word:"), {
      target: { value: "test-word" },
    });
    fireEvent.change(screen.getByLabelText("Description:"), {
      target: { value: "test description" },
    });
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/report/add",
        {
          reportType: "word_issue",
          word: "test-word",
          description: "test description",
        },
        expect.any(Object)
      );
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: "Report received",
        emotion: "positive",
      });
    });
  });

  it("should handle API errors", async () => {
    api.post.mockRejectedValue(new Error("API Error"));
    renderComponent();

    fireEvent.change(screen.getByLabelText("Description:"), {
      target: { value: "test" },
    });
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: "An error occurred",
        emotion: "negative",
      });
    });
  });

  it("should require description", async () => {
    renderComponent();

    const textarea = screen.getByLabelText("Description:");
    fireEvent.invalid(textarea);

    expect(textarea).toBeInvalid();
  });

  it("should update state on input changes", () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText("Report Type:"), {
      target: { value: "word_issue" },
    });
    fireEvent.change(screen.getByLabelText("Word:"), {
      target: { value: "new-word" },
    });
    fireEvent.change(screen.getByLabelText("Description:"), {
      target: { value: "new description" },
    });

    expect(screen.getByLabelText("Report Type:").value).toBe("word_issue");
    expect(screen.getByLabelText("Word:").value).toBe("new-word");
    expect(screen.getByLabelText("Description:").value).toBe("new description");
  });
});
