import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import MyCustomChart from "../arena/chart";

describe("MyCustomChart", () => {
  it("wyświetla komunikat ładowania gdy brak danych", () => {
    render(<MyCustomChart ranks={[]} />);
    expect(screen.getByText("Ładowanie danych...")).toBeInTheDocument();
  });

  it("renderuje wykres z poprawną liczbą elementów", () => {
    const ranks = [1000, 1500, 1200];
    render(<MyCustomChart ranks={ranks} />);

    // Sprawdź linie siatki
    const gridLines = screen.getAllByTestId("grid-line");
    expect(gridLines).toHaveLength(7);

    // Sprawdź segmenty linii
    const chartLines = screen.getAllByTestId("chart-line");
    expect(chartLines).toHaveLength(ranks.length - 1);

    // Sprawdź obecność kółka
    const circles = screen.getAllByTestId("chart-circle");
    expect(circles).toHaveLength(1);
  });

  it("poprawnie obsługuje rosnące wartości", () => {
    const ranks = [100, 200, 300];
    render(<MyCustomChart ranks={ranks} />);

    const lines = screen.getAllByTestId("chart-line");
    expect(lines[0]).toHaveClass("line-up");
    expect(lines[1]).toHaveClass("line-up");

    const circle = screen.getByTestId("chart-circle");
    expect(circle).toHaveClass("circle-up");
  });

  it("poprawnie obsługuje malejące wartości", () => {
    const ranks = [300, 200, 100];
    render(<MyCustomChart ranks={ranks} />);

    const lines = screen.getAllByTestId("chart-line");
    expect(lines[0]).toHaveClass("line-down");
    expect(lines[1]).toHaveClass("line-down");

    const circle = screen.getByTestId("chart-circle");
    expect(circle).toHaveClass("circle-down");
  });

  it("poprawnie obsługuje mieszane wartości", () => {
    const ranks = [100, 300, 200];
    render(<MyCustomChart ranks={ranks} />);

    const lines = screen.getAllByTestId("chart-line");
    expect(lines[0]).toHaveClass("line-up");
    expect(lines[1]).toHaveClass("line-down");

    const circle = screen.getByTestId("chart-circle");
    expect(circle).toHaveClass("circle-down");
  });

  it("obsługuje pojedynczą wartość", () => {
    const ranks = [500];
    render(<MyCustomChart ranks={ranks} />);

    expect(screen.queryAllByTestId("chart-line")).toHaveLength(0);
    const circle = screen.getByTestId("chart-circle");
    expect(circle).toHaveClass("circle-up");
  });

  it("filtruje punkty poza zakresem", () => {
    const longRanks = Array.from({ length: 20 }, (_, i) => i * 100);
    render(<MyCustomChart ranks={longRanks} />);

    const visiblePoints = screen.getAllByTestId("chart-line").length + 1;
    expect(visiblePoints).toBeLessThan(longRanks.length);
  });
});
