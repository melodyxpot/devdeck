import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/components/states/empty-state";

describe("EmptyState", () => {
  it("renders a useful empty message", () => {
    render(
      <EmptyState
        title="No projects found"
        description="Add a folder in Settings."
      />,
    );
    expect(screen.getByText("No projects found")).toBeInTheDocument();
    expect(screen.getByText("Add a folder in Settings.")).toBeInTheDocument();
  });
});
