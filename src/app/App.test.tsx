import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("application routes", () => {
  it("renders the roster route inside the shared shell", async () => {
    render(
      <MemoryRouter initialEntries={["/roster"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Unlock your next formation." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Game screens" })).toBeInTheDocument();
  });

  it("renders a recoverable not-found screen", async () => {
    render(
      <MemoryRouter initialEntries={["/unknown-route"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole("heading", { name: "This route leaves the mission map." }),
    ).toBeInTheDocument();
  });

  it("renders the Phase 2 content codex from validated data", async () => {
    render(
      <MemoryRouter initialEntries={["/content-lab"]}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: "The Content Codex" })).toBeInTheDocument();
    expect(screen.getByText("Validation passed")).toBeInTheDocument();
    expect(screen.getByText(/Duplicate ID 'ninja.ember'/)).toBeInTheDocument();
  });

  it("renders the Phase 3 combat forge from a completed simulation", async () => {
    render(
      <MemoryRouter initialEntries={["/combat-lab"]}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: "The Combat Forge" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Final battle state" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Battle event log" })).toBeInTheDocument();
  });

  it("plays and skips the Phase 4 battle event presentation", async () => {
    render(
      <MemoryRouter initialEntries={["/battle"]}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: "Underground Shrine" })).toBeInTheDocument();
    const battlefield = screen.getByRole("region", {
      name: "Animated four versus four battlefield",
    });
    expect(battlefield).toBeInTheDocument();
    expect(within(battlefield).getAllByRole("article")).toHaveLength(8);

    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(screen.getByRole("status", { name: "Battle result" })).toBeInTheDocument();
    expect(screen.getByText("Encounter resolved")).toBeInTheDocument();
  });
});
