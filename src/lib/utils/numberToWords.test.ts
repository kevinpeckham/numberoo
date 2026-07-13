import { describe, expect, it } from "vitest";

import {
	MAX_DIGITS,
	addCommas,
	normalizeDigits,
	numberToWords,
	scrubInput,
} from "./numberToWords";

const googol = `1${"0".repeat(100)}`;

describe("numberToWords", () => {
	it("returns empty string for empty input", () => {
		expect(numberToWords("")).toBe("");
	});

	it("handles zero, including leading-zero forms", () => {
		expect(numberToWords("0")).toBe("zero");
		expect(numberToWords("000")).toBe("zero");
	});

	it("ignores leading zeros", () => {
		expect(numberToWords("007")).toBe("seven");
	});

	it("translates single digits", () => {
		const words = [
			"one",
			"two",
			"three",
			"four",
			"five",
			"six",
			"seven",
			"eight",
			"nine",
		];
		words.forEach((word, i) => {
			expect(numberToWords(`${i + 1}`)).toBe(word);
		});
	});

	it("translates ten and the teens", () => {
		expect(numberToWords("10")).toBe("ten");
		expect(numberToWords("11")).toBe("eleven");
		expect(numberToWords("15")).toBe("fifteen");
		expect(numberToWords("19")).toBe("nineteen");
	});

	it("translates even tens without a trailing hyphen", () => {
		expect(numberToWords("20")).toBe("twenty");
		expect(numberToWords("30")).toBe("thirty");
		expect(numberToWords("40")).toBe("forty");
		expect(numberToWords("90")).toBe("ninety");
	});

	it("hyphenates compound tens", () => {
		expect(numberToWords("21")).toBe("twenty-one");
		expect(numberToWords("99")).toBe("ninety-nine");
	});

	it("translates hundreds", () => {
		expect(numberToWords("100")).toBe("one hundred");
		expect(numberToWords("105")).toBe("one hundred five");
		expect(numberToWords("110")).toBe("one hundred ten");
		expect(numberToWords("999")).toBe("nine hundred ninety-nine");
	});

	it("translates thousands", () => {
		expect(numberToWords("1000")).toBe("one thousand");
		expect(numberToWords("1005")).toBe("one thousand five");
	});

	it("skips zero triplets", () => {
		expect(numberToWords("1000000")).toBe("one million");
		expect(numberToWords("1000000001")).toBe("one billion one");
	});

	it("translates a full multi-triplet number", () => {
		expect(numberToWords("1234567")).toBe(
			"one million two hundred thirty-four thousand five hundred sixty-seven",
		);
	});

	it("translates large scale words", () => {
		expect(numberToWords(`1${"0".repeat(9)}`)).toBe("one billion");
		expect(numberToWords(`1${"0".repeat(30)}`)).toBe("one nonillion");
		expect(numberToWords(`1${"0".repeat(99)}`)).toBe("one duotrigintillion");
	});

	it("translates exactly one googol", () => {
		expect(numberToWords(googol)).toBe("one googol");
	});

	it("does not label near-googol numbers as googol", () => {
		const nearMiss = `1${"0".repeat(99)}1`;
		const result = numberToWords(nearMiss);
		expect(result).not.toContain("googol");
		expect(result).toBe("ten duotrigintillion one");
	});

	it("tolerates commas in input", () => {
		expect(numberToWords("1,234")).toBe("one thousand two hundred thirty-four");
	});

	it("never emits doubled, leading, or trailing whitespace or hyphens", () => {
		const samples = [
			"30",
			"105",
			"1000",
			"1000000",
			"200000030",
			`1${"0".repeat(45)}`,
		];
		for (const sample of samples) {
			const result = numberToWords(sample);
			expect(result).not.toMatch(/\s{2,}/);
			expect(result).toBe(result.trim());
			expect(result).not.toMatch(/-$/);
		}
	});
});

describe("scrubInput", () => {
	it("strips non-digit characters", () => {
		expect(scrubInput("1,2a3 !4")).toBe("1234");
		expect(scrubInput("abc")).toBe("");
	});

	it("returns empty string for empty input", () => {
		expect(scrubInput("")).toBe("");
	});

	it(`truncates to ${MAX_DIGITS} digits`, () => {
		expect(scrubInput("9".repeat(200))).toHaveLength(MAX_DIGITS);
	});
});

describe("normalizeDigits", () => {
	it("defaults empty input to zero", () => {
		expect(normalizeDigits("")).toBe("0");
		expect(normalizeDigits("abc")).toBe("0");
	});

	it("collapses all-zero input to a single zero", () => {
		expect(normalizeDigits("0")).toBe("0");
		expect(normalizeDigits("000")).toBe("0");
	});

	it("strips leading zeros", () => {
		expect(normalizeDigits("07")).toBe("7");
		expect(normalizeDigits("007")).toBe("7");
		expect(normalizeDigits("0123")).toBe("123");
	});

	it("strips non-digit characters", () => {
		expect(normalizeDigits("1,2a3")).toBe("123");
	});

	it(`truncates to ${MAX_DIGITS} digits after stripping zeros`, () => {
		const googol = `1${"0".repeat(100)}`;
		expect(normalizeDigits(`000${googol}`)).toBe(googol);
		expect(normalizeDigits("9".repeat(200))).toHaveLength(MAX_DIGITS);
	});
});

describe("addCommas", () => {
	it("returns empty string for empty input", () => {
		expect(addCommas("")).toBe("");
	});

	it("leaves short numbers alone", () => {
		expect(addCommas("1")).toBe("1");
		expect(addCommas("999")).toBe("999");
	});

	it("adds US thousands separators", () => {
		expect(addCommas("1234")).toBe("1,234");
		expect(addCommas("1234567")).toBe("1,234,567");
	});

	it("is idempotent on already-formatted input", () => {
		expect(addCommas("1,234,567")).toBe("1,234,567");
	});
});
