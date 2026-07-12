// Component tests for ButtonLink (href/title/class props + snippet children).

import { createRawSnippet } from "svelte";

import ButtonLink from "$components/ButtonLink.svelte";

import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";

const children = createRawSnippet(() => ({
	render: () => "<span>Go Home</span>",
}));

describe("ButtonLink", () => {
	it("renders its children as the link text", () => {
		render(ButtonLink, { children });
		expect(screen.getByRole("link", { name: "Go Home" })).toBeInTheDocument();
	});

	it("defaults href to '#'", () => {
		render(ButtonLink, { children });
		expect(screen.getByRole("link", { name: "Go Home" })).toHaveAttribute(
			"href",
			"#",
		);
	});

	it("applies href and title props", () => {
		render(ButtonLink, {
			children,
			href: "https://github.com/example",
			title: "Go to Github",
		});
		const anchor = screen.getByRole("link", { name: "Go Home" });
		expect(anchor).toHaveAttribute("href", "https://github.com/example");
		expect(anchor).toHaveAttribute("title", "Go to Github");
	});

	it("passes the class prop through to the wrapper", () => {
		const { container } = render(ButtonLink, { children, class: "mt-4" });
		const wrapper = container.querySelector("div");
		expect(wrapper).toHaveClass("mt-4");
	});
});
