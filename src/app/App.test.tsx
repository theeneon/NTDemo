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

  it("renders the Phase 2 content codex from validated data", () => {
    render(
      <MemoryRouter initialEntries={["/content-lab"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "The Content Codex" })).toBeInTheDocument();
    expect(screen.getByText("Validation passed")).toBeInTheDocument();
    expect(screen.getByText(/Duplicate ID 'ninja.ember'/)).toBeInTheDocument();
  });

  it("renders the Phase 3 combat forge from a completed simulation", () => {
    render(
      <MemoryRouter initialEntries={["/combat-lab"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "The Combat Forge" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Final battle state" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Battle event log" })).toBeInTheDocument();
  });
});
