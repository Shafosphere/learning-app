import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyButton from "../button/button";

describe("MyButton component", () => {
  it("renders the correct button text", () => {
    render(<MyButton message="Potwierdź" />);
    const buttonElement = screen.getByText("Potwierdź");
    expect(buttonElement).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<MyButton message="Kliknij mnie" onClick={handleClick} />);
    const buttonElement = screen.getByText("Kliknij mnie");

    await userEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});