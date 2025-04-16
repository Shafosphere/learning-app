import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import RankingTableContent from "../rankingtable/rankingtablecontent";
import { IntlProvider } from "react-intl";
import api from "../../utils/api";

// Mocki
vi.mock("../../utils/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockData = [
  { id: 1, username: "User1", points: 1000, avatar: 1 },
  { id: 2, username: "User2", points: 900, avatar: 2 },
  { id: 3, username: "User3", points: 800, avatar: 3 },
  { id: 4, username: "User4", points: 700, avatar: 4 },
];

const Wrapper = ({ lvl = "Flashcards" }) => (
  <IntlProvider locale="en" messages={{}}>
    <RankingTableContent setDisplay={vi.fn()} lvl={lvl} />
  </IntlProvider>
);

describe("RankingTableContent Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockReset();
  });

  it("powinien pobierać dane i renderować tabelę", async () => {
    api.get.mockResolvedValue({ data: mockData });
    render(<Wrapper />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/user/ranking-flashcard");
      expect(screen.getByText("User1")).toBeInTheDocument();
      expect(screen.getByText("1000")).toBeInTheDocument();
    });
  });

  it("powinien używać odpowiedniego endpointu dla Areny", async () => {
    api.get.mockResolvedValue({ data: mockData });
    render(<Wrapper lvl="Arena" />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/user/ranking-arena");
    });
  });

  it("powinien wyświetlać medale dla pierwszych trzech pozycji", async () => {
    api.get.mockResolvedValue({ data: mockData });
    const { container } = render(<Wrapper />);

    await waitFor(() => {
      const medals = container.querySelectorAll('img[alt*="medal"]');
      expect(medals).toHaveLength(3);
      // Sprawdzamy, że klasa zawiera oczekiwaną frazę
      expect(medals[0].className).toMatch(/gold/);
      expect(medals[1].className).toMatch(/silver/);
      expect(medals[2].className).toMatch(/bronze/);
    });
  });

  it("powinien renderować poprawne awatary", async () => {
    api.get.mockResolvedValue({ data: mockData });
    render(<Wrapper />);

    await waitFor(() => {
      const avatars = screen.getAllByAltText("ranking.user.avatar");
      expect(avatars[0].src).toContain("man.png");
      expect(avatars[1].src).toContain("man_1.png");
      expect(avatars[2].src).toContain("woman.png");
      expect(avatars[3].src).toContain("woman_1.png");
    });
  });

  it("powinien wyświetlać odpowiednią ikonę powrotu", async () => {
    api.get.mockResolvedValue({ data: mockData });

    const { rerender } = render(<Wrapper />);
    await waitFor(() => {
      expect(screen.getByTestId("FaBoxOpen")).toBeInTheDocument();
    });

    // Rerender z nowym lvl; również opakowujemy asercję w waitFor, aby dać czas na przetworzenie zmian.
    rerender(<Wrapper lvl="Arena" />);
    await waitFor(() => {
      expect(screen.getByTestId("FaTrophy")).toBeInTheDocument();
    });
  });

  it("powinien renderować nagłówki tabeli z tłumaczeniami", async () => {
    api.get.mockResolvedValue({ data: mockData });
    render(<Wrapper />);

    await waitFor(() => {
      expect(screen.getByText("ranking.position")).toBeInTheDocument();
      expect(screen.getByText("ranking.nickname")).toBeInTheDocument();
      expect(screen.getByText("ranking.points")).toBeInTheDocument();
    });
  });

  it("powinien obsługiwać błędy pobierania danych", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    api.get.mockRejectedValue(new Error("API error"));
    render(<Wrapper />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "ranking.error",
        expect.any(Error)
      );
    });
  });
});
