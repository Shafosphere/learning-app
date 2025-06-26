import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import MyCustomChart from "../arena/chart";

describe("MyCustomChart Component", () => {
  it("should display loading message when no data is provided", () => {
    render(<MyCustomChart ranks={[]} />);
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
  });

  it("should render the chart with the correct number of elements", () => {
    const ranks = [1000, 1500, 1200];
    render(<MyCustomChart ranks={ranks} />);

    // Check the grid lines
    const gridLines = screen.getAllByTestId("grid-line");
    expect(gridLines).toHaveLength(7);

    // Check the chart line segments
    const chartLines = screen.getAllByTestId("chart-line");
    expect(chartLines).toHaveLength(ranks.length - 1);

    // Check for the presence of the circle point
    const circles = screen.getAllByTestId("chart-circle");
    expect(circles).toHaveLength(1);
  });

  it("should correctly handle ascending values", () => {
    const ranks = [100, 200, 300];
    render(<MyCustomChart ranks={ranks} />);

    const lines = screen.getAllByTestId("chart-line");
    expect(lines[0]).toHaveClass("line-up");
    expect(lines[1]).toHaveClass("line-up");

    const circle = screen.getByTestId("chart-circle");
    expect(circle).toHaveClass("circle-up");
  });

  it("should correctly handle descending values", () => {
    const ranks = [300, 200, 100];
    render(<MyCustomChart ranks={ranks} />);

    const lines = screen.getAllByTestId("chart-line");
    expect(lines[0]).toHaveClass("line-down");
    expect(lines[1]).toHaveClass("line-down");

    const circle = screen.getByTestId("chart-circle");
    expect(circle).toHaveClass("circle-down");
  });

  it("should correctly handle mixed values", () => {
    const ranks = [100, 300, 200];
    render(<MyCustomChart ranks={ranks} />);

    const lines = screen.getAllByTestId("chart-line");
    expect(lines[0]).toHaveClass("line-up");
    expect(lines[1]).toHaveClass("line-down");

    const circle = screen.getByTestId("chart-circle");
    expect(circle).toHaveClass("circle-down");
  });

  it("should handle a single value correctly", () => {
    const ranks = [500];
    render(<MyCustomChart ranks={ranks} />);

    expect(screen.queryAllByTestId("chart-line")).toHaveLength(0);
    const circle = screen.getByTestId("chart-circle");
    expect(circle).toHaveClass("circle-up");
  });

  it("should filter out points outside the visible range", () => {
    const longRanks = Array.from({ length: 20 }, (_, i) => i * 100);
    render(<MyCustomChart ranks={longRanks} />);

    // Only a subset of points should be visible
    const visiblePoints = screen.getAllByTestId("chart-line").length + 1;
    expect(visiblePoints).toBeLessThan(longRanks.length);
  });
});
