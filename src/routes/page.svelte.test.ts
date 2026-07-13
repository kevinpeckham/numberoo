// Component tests for the home page — typing, the keypad, and derived output.

import Page from "./+page.svelte";

import { render, screen } from "@testing-library/svelte";
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

	it("focuses the input on load", () => {
		render(Page);
		expect(getInput()).toHaveFocus();
	});

	it("shows an inviting placeholder when empty", async () => {
		const user = userEvent.setup();
		render(Page);

		expect(screen.getByText("type any number")).toBeInTheDocument();

		await user.type(getInput(), "5");
		expect(screen.queryByText("type any number")).not.toBeInTheDocument();
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
		await user.click(screen.getByRole("button", { name: "1" }));

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

	it("disables the read-aloud button when there is no number", () => {
		render(Page);
		expect(
			screen.getByRole("button", { name: "read number aloud" }),
		).toBeDisabled();
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
