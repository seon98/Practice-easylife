import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import AuthForm from "@/components/AuthForm";
import { login } from "@/lib/api/auth";

vi.mock("next/link", () => ({ default: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/AuthProvider", () => ({ useAuth: () => ({ acceptAuth: vi.fn() }) }));
vi.mock("@/lib/api/auth", () => ({ login: vi.fn(), signup: vi.fn() }));

test("shows API login error", async () => {
  vi.mocked(login).mockRejectedValue(new Error("Invalid email or password"));
  render(<AuthForm mode="login" />);
  fireEvent.change(screen.getByLabelText("이메일"), { target: { value: "user@example.com" } });
  fireEvent.change(screen.getByLabelText("비밀번호"), { target: { value: "wrong" } });
  fireEvent.click(screen.getByRole("button", { name: "로그인" }));
  await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password"));
});
