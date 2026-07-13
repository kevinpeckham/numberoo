// Component tests for the about page — heading, story, and links.

import Page from "./+page.svelte";

import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";

describe("about page", () => {
	it("renders the headline", () => {
		render(Page);
		expect(
			screen.getByRole("heading", { name: "About Numberoo" }),
		).toBeInTheDocument();
	});

	it("links back to the app", () => {
		render(Page);
		expect(
			screen.getByRole("link", { name: /back to Numberoo/ }),
		).toHaveAttribute("href", "/");
	});

	it("links to the full essay and the repo", () => {
		render(Page);
		expect(screen.getByRole("link", { name: /full essay/ })).toHaveAttribute(
			"href",
			"https://www.lightningjar.com/blog/the-number-that-doesnt-fit-in-a-number",
		);
		expect(
			screen.getByRole("link", { name: "Numberoo on GitHub" }),
		).toHaveAttribute("href", "https://github.com/kevinpeckham/numberoo");
	});
});
