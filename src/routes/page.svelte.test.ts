// Component tests for the home page — typing, the controls, and derived output.

import Page from "./+page.svelte";

import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// jsdom has no Web Speech API -- stub it so the read-aloud button is testable
class FakeUtterance {
	text: string;
	constructor(text: string) {
		this.text = text;
	}
}
const synthMock = {
	speaking: false,
	speak: vi.fn(),
	cancel: vi.fn(),
};
vi.stubGlobal("speechSynthesis", synthMock);
vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);

beforeEach(() => {
	synthMock.speaking = false;
	synthMock.speak.mockClear();
	synthMock.cancel.mockClear();
});

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

	it("links to the about page for desktop and mobile", () => {
		render(Page);
		// desktop text link + mobile "?" icon link
		expect(screen.getByRole("link", { name: "about" })).toHaveAttribute(
			"href",
			"/about",
		);
		expect(
			screen.getByRole("link", { name: "About Numberoo" }),
		).toHaveAttribute("href", "/about");
	});

	it("starts with a visible zero", () => {
		render(Page);
		expect(getInput()).toHaveValue("0");
		expect(screen.getByText(/zero/)).toBeInTheDocument();
		expect(screen.getByText(/# digits: 1/)).toBeInTheDocument();
	});

	it("removes the leading zero as you type", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "7");

		expect(getInput()).toHaveValue("7");
		expect(screen.getByText(/seven/)).toBeInTheDocument();
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

	it("accepts digits typed anywhere on the page", async () => {
		const user = userEvent.setup();
		render(Page);

		// move focus away from the input; typing should still register
		getInput().blur();
		document.body.focus();
		await user.keyboard("70");

		expect(getInput()).toHaveValue("70");
		expect(screen.getByText(/seventy/)).toBeInTheDocument();
		expect(screen.getByText(/# digits: 2/)).toBeInTheDocument();
	});

	it("handles backspace typed anywhere on the page", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "42");
		getInput().blur();
		document.body.focus();
		await user.keyboard("{Backspace}");

		expect(getInput()).toHaveValue("4");
		expect(screen.getByText(/# digits: 1/)).toBeInTheDocument();
	});

	it("always shows the blinking caret, focused or not", async () => {
		const { container } = render(Page);

		expect(container.querySelector(".caret")).toBeInTheDocument();

		getInput().blur();
		await Promise.resolve();
		expect(container.querySelector(".caret")).toBeInTheDocument();
	});

	it("clear resets the input to zero", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "999");
		await user.click(screen.getByRole("button", { name: "clear" }));

		expect(getInput()).toHaveValue("0");
		expect(screen.getByText(/# digits: 1/)).toBeInTheDocument();
	});

	it("focuses the input on load", () => {
		render(Page);
		expect(getInput()).toHaveFocus();
	});

	it("shows a continue overlay when the window loses focus", async () => {
		const user = userEvent.setup();
		const { container } = render(Page);

		expect(
			screen.queryByText(/Click below to continue/),
		).not.toBeInTheDocument();

		await fireEvent.blur(window);
		expect(screen.getByText(/Click below to continue/)).toBeInTheDocument();
		expect(container.querySelector(".caret-idle")).toBeInTheDocument();

		// the continue button re-focuses the input
		getInput().blur();
		await user.click(screen.getByRole("button", { name: "Continue" }));
		expect(getInput()).toHaveFocus();

		await fireEvent.focus(window);
		expect(
			screen.queryByText(/Click below to continue/),
		).not.toBeInTheDocument();
		expect(container.querySelector(".caret-idle")).not.toBeInTheDocument();
	});

	it("focuses the input via the keyboard button", async () => {
		const user = userEvent.setup();
		render(Page);

		getInput().blur();
		expect(getInput()).not.toHaveFocus();

		await user.click(screen.getByRole("button", { name: "open keyboard" }));
		expect(getInput()).toHaveFocus();
	});

	it("increments the number with +1", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "9");
		await user.click(screen.getByRole("button", { name: "add one" }));

		expect(getInput()).toHaveValue("10");
		expect(screen.getByText(/ten/)).toBeInTheDocument();
	});

	it("decrements the number with -1", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "10");
		await user.click(screen.getByRole("button", { name: "subtract one" }));

		expect(getInput()).toHaveValue("9");
	});

	it("adds and subtracts one hundred", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "50");
		await user.click(screen.getByRole("button", { name: "add one hundred" }));
		expect(getInput()).toHaveValue("150");

		await user.click(
			screen.getByRole("button", { name: "subtract one hundred" }),
		);
		expect(getInput()).toHaveValue("50");

		// clamps at zero
		await user.click(
			screen.getByRole("button", { name: "subtract one hundred" }),
		);
		expect(getInput()).toHaveValue("0");
	});

	it("does not decrement below zero", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "0");
		await user.click(screen.getByRole("button", { name: "subtract one" }));

		expect(getInput()).toHaveValue("0");
		expect(screen.getByText(/zero/)).toBeInTheDocument();
	});

	it("shows a max indicator at the digit limit", async () => {
		const user = userEvent.setup();
		render(Page);

		expect(screen.queryByText(/\(max\)/)).not.toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "one googol" }));

		expect(screen.getByText(/\(max\)/)).toBeInTheDocument();
	});

	it("stops speech when the number changes", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "42");
		synthMock.speaking = true;
		await user.type(getInput(), "1");

		expect(synthMock.cancel).toHaveBeenCalled();
		expect(getInput()).toHaveValue("421");
	});

	it("loads one googol when the tagline easter egg is clicked", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.click(screen.getByRole("button", { name: "one googol" }));

		expect(getInput().value.replace(/,/g, "")).toBe(`1${"0".repeat(100)}`);
		expect(screen.getByText(/# digits: 101/)).toBeInTheDocument();
		// appears in both the tagline button and the output line
		expect(screen.getAllByText(/one googol/)).toHaveLength(2);
	});

	it("reads the default zero aloud", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.click(screen.getByRole("button", { name: "read number aloud" }));

		expect(synthMock.speak).toHaveBeenCalledTimes(1);
		const utterance = synthMock.speak.mock.calls[0][0] as FakeUtterance;
		expect(utterance.text).toBe("zero");
	});

	it("reads the output aloud on click", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "42");
		await user.click(screen.getByRole("button", { name: "read number aloud" }));

		expect(synthMock.speak).toHaveBeenCalledTimes(1);
		const utterance = synthMock.speak.mock.calls[0][0] as FakeUtterance;
		expect(utterance.text).toBe("forty-two");
	});

	it("stops speech when clicked while speaking", async () => {
		const user = userEvent.setup();
		render(Page);

		await user.type(getInput(), "42");
		synthMock.speaking = true;
		await user.click(screen.getByRole("button", { name: "read number aloud" }));

		expect(synthMock.cancel).toHaveBeenCalledTimes(1);
		expect(synthMock.speak).not.toHaveBeenCalled();
	});
});
