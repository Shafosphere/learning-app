import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import Login from "../../pages/login/login";

// Mock form components to isolate Login component logic
vi.mock("../../components/login/loginForm", () => ({
  default: () => <div data-testid="login-form" />,
}));

vi.mock("../../components/login/regiForm", () => ({
  default: () => <div data-testid="register-form" />,
}));

vi.mock("../../components/login/resetForm", () => ({
  default: () => <div data-testid="reset-form" />,
}));

// Mock MyButton to test only display logic
vi.mock("../../components/button/button", () => ({
  default: vi.fn(({ message, onClick }) => (
    <button onClick={onClick}>{message}</button>
  )),
}));

// Wrapper component to provide routing and internationalization
const Wrapper = ({ children, initialEntries }) => (
  <MemoryRouter initialEntries={initialEntries}>
    <IntlProvider locale="en">{children}</IntlProvider>
  </MemoryRouter>
);

describe("Login component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form by default", () => {
    render(
      <Wrapper>
        <Login />
      </Wrapper>
    );

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("switches to registration form on Register button click", async () => {
    render(
      <Wrapper>
        <Login />
      </Wrapper>
    );

    await userEvent.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(screen.getByTestId("register-form")).toBeInTheDocument();
      expect(screen.getByText("Log In")).toBeInTheDocument();
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });
  });

  it("switches to reset form on Reset button click", async () => {
    render(
      <Wrapper>
        <Login />
      </Wrapper>
    );

    await userEvent.click(screen.getByText("Reset"));

    await waitFor(() => {
      expect(screen.getByTestId("reset-form")).toBeInTheDocument();
      expect(screen.getByText("Log In")).toBeInTheDocument();
      expect(screen.getByText("Register")).toBeInTheDocument();
    });
  });

  it("renders registration form when initialized via location state", () => {
    render(
      <Wrapper initialEntries={[{ state: { display: "register" } }]}>
        <Login />
      </Wrapper>
    );

    expect(screen.getByTestId("register-form")).toBeInTheDocument();
  });

  it("renders reset form when initialized via location state", () => {
    render(
      <Wrapper initialEntries={[{ state: { display: "reset" } }]}>
        <Login />
      </Wrapper>
    );

    expect(screen.getByTestId("reset-form")).toBeInTheDocument();
  });

  it("switches back to login from registration", async () => {
    render(
      <Wrapper initialEntries={[{ state: { display: "register" } }]}>
        <Login />
      </Wrapper>
    );

    await userEvent.click(screen.getByText("Log In"));

    await waitFor(() => {
      expect(screen.getByTestId("login-form")).toBeInTheDocument();
    });
  });

  it("handles invalid location state gracefully by defaulting to login form", () => {
    render(
      <Wrapper initialEntries={[{ state: { display: "invalid" } }]}>
        <Login />
      </Wrapper>
    );

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });
});
