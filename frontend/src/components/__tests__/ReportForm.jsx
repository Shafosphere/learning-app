import React from "react";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from "vitest";
import ReportForm from "../report/report";
import { IntlProvider } from "react-intl";
import { PopupContext } from "../popup/popupcontext";
import api from "../../utils/api";

// Mock tłumaczeń
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

  it("powinien poprawnie renderować formularz", () => {
    renderComponent();

    expect(screen.getByLabelText("Report Type:")).toBeInTheDocument();
    expect(screen.getByLabelText("Description:")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit Report" })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Word:")).not.toBeInTheDocument();
  });

  it("powinien wyświetlać pole Word po wybraniu word_issue", () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText("Report Type:"), {
      target: { value: "word_issue" },
    });

    expect(screen.getByLabelText("Word:")).toBeInTheDocument();
  });

  it("powinien wysyłać formularz z poprawnymi danymi", async () => {
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

  it("powinien obsługiwać błędy API", async () => {
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

  it("powinien wymagać opisu", async () => {
    renderComponent();

    const textarea = screen.getByLabelText("Description:");
    fireEvent.invalid(textarea);

    expect(textarea).toBeInvalid();
  });

  it("powinien aktualizować stan przy zmianie inputów", () => {
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
