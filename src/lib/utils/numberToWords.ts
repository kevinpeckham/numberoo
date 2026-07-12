// Pure number-to-words conversion logic for Numberoo.
// Handles digit strings up to one googol (1 followed by 100 zeros).

export const MAX_DIGITS = 101;

// 0–20 have unique names
const UNDER_21 = [
	"zero",
	"one",
	"two",
	"three",
	"four",
	"five",
	"six",
	"seven",
	"eight",
	"nine",
	"ten",
	"eleven",
	"twelve",
	"thirteen",
	"fourteen",
	"fifteen",
	"sixteen",
	"seventeen",
	"eighteen",
	"nineteen",
	"twenty",
] as const;

const TENS = [
	"",
	"",
	"twenty",
	"thirty",
	"forty",
	"fifty",
	"sixty",
	"seventy",
	"eighty",
	"ninety",
] as const;

// Scale words by triplet position: index 1 = thousand (10^3), 2 = million (10^6), …
// index 33 = duotrigintillion (10^99). 10 duotrigintillion == 1 googol.
const SCALE = [
	"",
	"thousand",
	"million",
	"billion",
	"trillion",
	"quadrillion",
	"quintillion",
	"sextillion",
	"septillion",
	"octillion",
	"nonillion",
	"decillion",
	"undecillion",
	"duodecillion",
	"tredecillion",
	"quattuor-decillion",
	"quindecillion",
	"sexdecillion",
	"septen-decillion",
	"octodecillion",
	"novemdecillion",
	"vigintillion",
	"unvigintillion",
	"duovigintillion",
	"trevigintillion",
	"quattuorvigintillion",
	"quinvigintillion",
	"sexvigintillion",
	"septen-vigintillion",
	"octovigintillion",
	"novemvigintillion",
	"trigintillion",
	"untrigintillion",
	"duotrigintillion",
] as const;

const GOOGOL = `1${"0".repeat(100)}`;

/** Strip all non-digit characters and truncate to MAX_DIGITS. "1,2a3" -> "123" */
export function scrubInput(raw: string): string {
	return raw.replace(/[^0-9]/g, "").slice(0, MAX_DIGITS);
}

/** Add US thousands separators to a digit string. "1234567" -> "1,234,567". Idempotent. */
export function addCommas(digits: string): string {
	const noCommas = digits.replace(/,/g, "");
	return noCommas.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Pad with leading zeros until length is divisible by three. */
function padWithZeros(digits: string): string {
	const remainder = digits.length % 3;
	return remainder ? "0".repeat(3 - remainder) + digits : digits;
}

/** Split a zero-padded digit string into groups of three. */
function splitIntoTriplets(padded: string): string[] {
	const triplets = [];
	for (let i = 0; i < padded.length; i += 3) {
		triplets.push(padded.slice(i, i + 3));
	}
	return triplets;
}

/** Translate one triplet ("042") into words ("forty-two"). Returns "" for "000". */
function translateTriplet(triplet: string): string {
	const value = Number(triplet);
	const hundredsDigit = Math.floor(value / 100);
	const lastTwo = value % 100;

	const parts = [];
	if (hundredsDigit) parts.push(`${UNDER_21[hundredsDigit]} hundred`);
	if (lastTwo) {
		if (lastTwo <= 20) {
			parts.push(UNDER_21[lastTwo]);
		} else {
			const tensDigit = Math.floor(lastTwo / 10);
			const onesDigit = lastTwo % 10;
			parts.push(
				onesDigit
					? `${TENS[tensDigit]}-${UNDER_21[onesDigit]}`
					: TENS[tensDigit],
			);
		}
	}
	return parts.join(" ");
}

/**
 * Convert a digit string to English words.
 * "" -> "", "0" -> "zero", "007" -> "seven", googol (10^100) -> "one googol".
 */
export function numberToWords(digits: string): string {
	const scrubbed = digits.replace(/[^0-9]/g, "");
	if (!scrubbed) return "";

	const stripped = scrubbed.replace(/^0+/, "");
	if (!stripped) return "zero";
	if (stripped === GOOGOL) return "one googol";

	const triplets = splitIntoTriplets(padWithZeros(stripped));
	const parts = [];
	for (let i = 0; i < triplets.length; i++) {
		const words = translateTriplet(triplets[i]);
		// skip zero triplets entirely -- "zero million" is not a thing
		if (!words) continue;
		const scaleWord = SCALE[triplets.length - 1 - i];
		parts.push(scaleWord ? `${words} ${scaleWord}` : words);
	}
	return parts.join(" ");
}
