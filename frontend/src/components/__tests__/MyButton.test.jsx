import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyButton from "../button/button";

describe("MyButton component", () => {
  it("renderuje poprawny tekst przycisku", () => {
    render(<MyButton message="Potwierdź" />);
    const buttonElement = screen.getByText("Potwierdź");
    expect(buttonElement).toBeInTheDocument();
  });

  it("wywołuje onClick po kliknięciu", async () => {
    const handleClick = vi.fn();
    render(<MyButton message="Kliknij mnie" onClick={handleClick} />);
    const buttonElement = screen.getByText("Kliknij mnie");

    await userEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
