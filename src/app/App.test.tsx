import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("application routes", () => {
  it("renders the roster route inside the shared shell", () => {
    render(
      <MemoryRouter initialEntries={["/roster"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Choose your next formation." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Game screens" })).toBeInTheDocument();
  });

  it("renders a recoverable not-found screen", () => {
    render(
      <MemoryRouter initialEntries={["/unknown-route"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "This route leaves the mission map." }),
    ).toBeInTheDocument();
  });
});
