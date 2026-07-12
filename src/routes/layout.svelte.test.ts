// Component tests for the layout — footer attribution.

import Layout from "./+layout.svelte";

import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";

describe("layout", () => {
	it("renders the footer attribution", () => {
		render(Layout);
		expect(screen.getByText(/Made by Kevin Peckham @/)).toBeInTheDocument();
		expect(screen.getByText(/in Philadelphia/)).toBeInTheDocument();
	});

	it("links Lightning Jar to lightningjar.com", () => {
		render(Layout);
		expect(screen.getByRole("link", { name: "Lightning Jar" })).toHaveAttribute(
			"href",
			"https://www.lightningjar.com",
		);
	});
});
