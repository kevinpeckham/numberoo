// Component tests for the home page — typing, the keypad, and derived output.

import Page from "./+page.svelte";

import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

function getInput() {
	return screen.getByRole("textbox", {
		name: "input number",
	}) as HTMLTextAreaElement;
}

describe("home page", () => {
	it("renders the headline", () => {
		render(Page);
		expect(
			screen.getByRole("heading", { name: "Numberoo" }),
		).toBeInTheDocument();
	});

	it("starts empty with a zero digit count", () => {
		render(Page);
		expect(getInput()).toHaveValue("");
		expect(screen.getByText(/# digits: 0/)).toBeInTheDocument();
	});

	it("converts typed input to words, commas, and a digit count", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "1234");

		expect(getInput()).toHaveValue("1,234");
		expect(
			screen.getByText(/one thousand two hundred thirty-four/),
		).toBeInTheDocument();
		expect(screen.getByText(/# digits: 4/)).toBeInTheDocument();
	});

	it("shows zero for typed 0", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "0");

		expect(screen.getByText(/zero/)).toBeInTheDocument();
	});

	it("rejects non-numeric characters", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "1a2b3");

		expect(getInput()).toHaveValue("123");
		expect(screen.getByText(/one hundred twenty-three/)).toBeInTheDocument();
	});

	it("appends digits from the keypad, including zero", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.click(screen.getByRole("button", { name: "7" }));
		await user.click(screen.getByRole("button", { name: "0" }));

		expect(getInput()).toHaveValue("70");
		expect(screen.getByText(/seventy/)).toBeInTheDocument();
		expect(screen.getByText(/# digits: 2/)).toBeInTheDocument();
	});

	it("keypad and typing share the same state", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "12");
		await user.click(screen.getByRole("button", { name: "3" }));

		expect(getInput()).toHaveValue("123");
		expect(screen.getByText(/one hundred twenty-three/)).toBeInTheDocument();
	});

	it("backspace removes the last digit and recomputes", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "42");
		await user.click(screen.getByRole("button", { name: "backspace" }));

		expect(getInput()).toHaveValue("4");
		expect(screen.getByText(/# digits: 1/)).toBeInTheDocument();
	});

	it("clear empties the input and resets the count", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "999");
		await user.click(screen.getByRole("button", { name: "clear" }));

		expect(getInput()).toHaveValue("");
		expect(screen.getByText(/# digits: 0/)).toBeInTheDocument();
	});
});
