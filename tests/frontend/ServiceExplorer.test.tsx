import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import ServiceExplorer from "@/components/ServiceExplorer";

vi.mock("next/link", () => ({ default: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock("@/hooks/useFavorites", () => ({ useFavorites: () => ({ favoriteIds: [1], toggleFavorite: vi.fn(), isFavorite: (id: number) => id === 1, isHydrated: true }) }));

const services = [
  { id: 1, name: "정부24", description: "민원", category: "공공", url: "https://gov.kr" },
  { id: 2, name: "홈택스", description: "세금", category: "세금", url: "https://hometax.go.kr" },
];

test("searches and filters services", () => {
  render(<ServiceExplorer services={services} />);
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "홈택스" } });
  expect(screen.getByText("홈택스")).toBeInTheDocument();
  expect(screen.queryByText("정부24")).not.toBeInTheDocument();
});

test("shows favorites only", () => {
  render(<ServiceExplorer services={services} />);
  fireEvent.click(screen.getByRole("button", { name: /즐겨찾기만 보기/ }));
  expect(screen.getByText("정부24")).toBeInTheDocument();
  expect(screen.queryByText("홈택스")).not.toBeInTheDocument();
});
