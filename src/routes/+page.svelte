<script lang="ts">
// utils
import { addCommas, numberToWords, scrubInput } from "$utils/numberToWords";

const GOOGOL_DIGITS = `1${"0".repeat(100)}`;

// state: canonical digit string -- scrubbed, no commas
let digits = $state("");

// derived display values
const formatted = $derived(addCommas(digits));
const output = $derived(numberToWords(digits));
const digitCount = $derived(digits.length);

// refs
let inputEl: HTMLTextAreaElement | undefined = $state();

// single update path shared by typing and the keypad
function setDigits(raw: string) {
	digits = scrubInput(raw);
}

function onInput(e: Event) {
	const target = e.currentTarget as HTMLTextAreaElement;
	setDigits(target.value);
	// write back so rejected characters never linger in the field,
	// even when the scrubbed state is unchanged
	target.value = formatted;
}

const navigationKeys = [
	"Tab",
	"Escape",
	"Backspace",
	"Delete",
	"Enter",
	"ArrowRight",
	"ArrowLeft",
	"ArrowUp",
	"ArrowDown",
	"Home",
	"End",
];

// block non-digit keys, but let shortcuts (copy, paste, select-all) through
function onKeydown(e: KeyboardEvent) {
	if (e.metaKey || e.ctrlKey) return;
	if (/^[0-9]$/.test(e.key) || navigationKeys.includes(e.key)) return;
	e.preventDefault();
}

function appendDigit(digit: string) {
	setDigits(digits + digit);
	inputEl?.focus();
}

function backspace() {
	setDigits(digits.slice(0, -1));
	inputEl?.focus();
}

function clear() {
	setDigits("");
	inputEl?.focus();
}

// easter egg: clicking "one googol" in the tagline loads a googol
function loadGoogol() {
	setDigits(GOOGOL_DIGITS);
	inputEl?.focus();
}

// read the output aloud via the Web Speech API;
// clicking while speech is in progress stops it instead
function speakOutput() {
	if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
	const synth = window.speechSynthesis;
	if (synth.speaking) {
		synth.cancel();
		return;
	}
	if (!output) return;
	synth.speak(new SpeechSynthesisUtterance(output));
}
</script>

<svelte:head>
	<title>Numberoo</title>
	<meta
		content="Read and spell numbers up to one googol -- convert any number into English words."
		name="description"
	/>
</svelte:head>

<main
	class="relative grid grid-cols-1 min-h-screen p-2 w-screen items-start pt-0 sm:p-4 sm:pt-24 sm:place-content-start"
>
	<div class="mb-4 pt-4 sm:pl-8 sm:absolute sm:flex items-baseline gap-x-4">
		<h1 class="text-3xl font-bold text-blue-300 mb-2">Numberoo</h1>
		<div class="hidden opacity-95 italic sm:block">
			read and spell numbers up to <button
				class="italic hover:text-blue-300 hover:underline underline-offset-4 transition-colors"
				onclick={loadGoogol}>one googol</button
			>
		</div>
	</div>

	<!-- left column -->
	<div class="col-span-3">
		<!-- input -->
		<div class="w-full flex justify-center text-center pb-4 h-auto min-h-[1em]">
			<!-- container -->
			<div
				class="relative align-text-bottom text-[24px] flex justify-center items-end h-full leading-snug sm:text-[36px] max-w-[90vw]"
			>
				<textarea
					aria-label="input number"
					autocomplete="off"
					bind:this={inputEl}
					class="opacity-0 absolute bg-transparent text-white text-center h-full w-full border-white/20 outline-none min-h-[1em] placeholder:whitespace-nowrap placeholder:text-[18px]"
					inputmode="numeric"
					placeholder="enter number"
					oninput={onInput}
					onkeydown={onKeydown}
					style="resize:none; min-width:6ch; min-height:1em;"
					value={formatted}
				></textarea>
				<div
					class="pointer-events-none align-text-bottom h-fit w-fit text-center break-words px-4 rounded bg-blue-500/10 min-w-[6ch] min-h-[1.375em]"
				>
					{formatted}
				</div>
			</div>
		</div>

		<!-- output -->
		<div class="text-[26px] text-center text-blue-400">&nbsp;{output}&nbsp;</div>

		<!-- read aloud -->
		<div class="flex justify-center pt-2">
			<button
				aria-label="read number aloud"
				class="rounded-full border border-blue-400 text-blue-400 px-4 py-1 text-[15px] flex items-center gap-x-2 hover:bg-blue-400/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent border-[0.065em]"
				disabled={!digits}
				onclick={speakOutput}
			>
				<span aria-hidden="true">🔊</span>
				<span>read aloud</span>
			</button>
		</div>

		<!-- digit counter -->
		<div class="absolute bottom-8 text-yellow-600 pl-4">
			# digits: {digitCount}
		</div>
	</div>

	<!-- right column: keypad -->
	<div
		class="w-full flex justify-center items-end pb-16 sm:absolute sm:bottom-0 sm:right-0 sm:pb-24 sm:items-end"
	>
		<div
			class="grid grid-cols-3 w-full place-content-end bg-primary max-w-[60vw] sm:max-w-[20em] gap-2 sm:gap-x-4 sm:gap-y-2"
		>
			{#each Array(9) as _, index}
				<button
					class="rounded-full border aspect-square flex justify-center items-center hover:bg-white/5 transition-colors active:bg-white border-[0.065em] text-[1.5em]"
					onclick={() => appendDigit(`${index + 1}`)}
				>
					{index + 1}
				</button>
			{/each}

			<!-- backspace -->
			<button
				aria-label="backspace"
				class="text-red-500 rounded-full border border-red-500 aspect-square flex justify-center items-center hover:bg-red-500/5 transition-colors active:bg-red-500 border-[0.065em] text-[1.5em]"
				onclick={backspace}
			>
				{"<"}
			</button>

			<!-- zero -->
			<button
				class="rounded-full border aspect-square flex justify-center items-center hover:bg-white/5 transition-colors active:bg-white border-[0.065em] text-[1.5em]"
				onclick={() => appendDigit("0")}
			>
				0
			</button>

			<!-- clear -->
			<button
				aria-label="clear"
				class="text-red-500 rounded-full border border-red-500 aspect-square flex justify-center items-center hover:bg-red-500/5 transition-colors active:bg-red-500 border-[0.065em] text-[1.5em]"
				onclick={clear}
			>
				{"c"}
			</button>
		</div>
	</div>
</main>
