<script lang="ts">
// utils
import {
	MAX_DIGITS,
	addCommas,
	numberToWords,
	scrubInput,
} from "$utils/numberToWords";

const GOOGOL_DIGITS = `1${"0".repeat(100)}`;

// state: canonical digit string -- scrubbed, no commas
let digits = $state("");

// derived display values
const formatted = $derived(addCommas(digits));
const output = $derived(numberToWords(digits));
const digitCount = $derived(digits.length);
const atMaxDigits = $derived(digitCount >= MAX_DIGITS);

// refs
let inputEl: HTMLTextAreaElement | undefined = $state();

// focus state drives the shim's blinking caret
let inputFocused = $state(false);

// keep the field focused on load so the keyboard is ready --
// especially the native keyboard on mobile
$effect(() => {
	inputEl?.focus();
});

// stop any in-progress speech; reading a stale number is confusing
function stopSpeech() {
	if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
	if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
}

// single update path shared by typing and the keypad
function setDigits(raw: string) {
	stopSpeech();
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

// desktop: typing anywhere on the page feeds the input,
// no need to focus the field first
function onWindowKeydown(e: KeyboardEvent) {
	if (e.metaKey || e.ctrlKey || e.altKey) return;
	if (e.target === inputEl) return;
	// don't steal Enter/Space from focused buttons
	const target = e.target as HTMLElement | null;
	if (
		target instanceof HTMLButtonElement &&
		(e.key === "Enter" || e.key === " ")
	)
		return;
	if (/^[0-9]$/.test(e.key)) {
		e.preventDefault();
		appendDigit(e.key);
	} else if (e.key === "Backspace") {
		e.preventDefault();
		backspace();
	}
}

function clear() {
	setDigits("");
	inputEl?.focus();
}

// +1 / -1 controls; BigInt because the number can be up to a googol.
// Clamps at zero and refuses to grow past MAX_DIGITS.
function addToNumber(delta: bigint) {
	const current = digits ? BigInt(digits) : 0n;
	let next = current + delta;
	if (next < 0n) next = 0n;
	const nextDigits = next.toString();
	if (nextDigits.length > MAX_DIGITS) return;
	setDigits(nextDigits);
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

<svelte:window onkeydown={onWindowKeydown} />

<svelte:head>
	<title>Numberoo</title>
	<meta
		content="Read and spell numbers up to one googol -- convert any number into English words."
		name="description"
	/>
</svelte:head>

<main
	class="relative grid grid-cols-1 grid-rows-[auto_1fr_auto] h-screen min-h-screen w-screen items-start page-x-padding sm-py-4 place-content-start gap-y-2 sm-gap-y-4"
>
	<header class="pt-4 lg-flex items-baseline gap-x-4">
		<h1 class="text-20px font-bold text-blue-300 mb-2">Numberoo</h1>
		<div class="hidden opacity-95 italic sm:block">
			read and spell numbers up to <button
				class="italic hover:text-blue-300 hover:underline underline-offset-4 transition-colors"
				onclick={loadGoogol}>one googol</button
			>
		</div>
	</header>

	<!-- left column -->
	<div class="col-span-3 h-full w-full max-h-full grid grid-cols-1  place-content-start grid-rows-[auto_1fr_auto] sm-grid-rows-[auto_1fr_auto]">
		<!-- input -->
		<div class="w-full flex justify-center text-center pb-4 h-auto min-h-[1em]">
			<!-- container -->
			<div
				class="relative align-text-bottom text-[24px] flex justify-center items-end h-full leading-snug sm:text-[32px] max-w-full w-full"
			>
				<!-- svelte-ignore a11y_autofocus -->
				<textarea
					aria-label="input number"
					autocomplete="off"
					autofocus
					bind:this={inputEl}
					class="opacity-0 absolute bg-transparent text-white text-center h-full w-full border-white/20 outline-none resize-none min-w-full min-w-1em leading-snug"
					inputmode="numeric"
					placeholder="type any number"
					oninput={onInput}
					onkeydown={onKeydown}
					onfocus={() => (inputFocused = true)}
					onblur={() => (inputFocused = false)}
					value={formatted}
				></textarea>
				<div
					class="pointer-events-none h-fit lg-w-fit text-center sm-text-left break-words px-4 rounded bg-blue-500/10 w-full lg-min-w-[6ch] min-h-1.375em sm-h-130px"
				>
					{#if digits}
						{formatted}{#if inputFocused}<span
								aria-hidden="true"
								class="caret"
							></span>{/if}
					{:else}
						{#if inputFocused}<span aria-hidden="true" class="caret"
							></span>{/if}<span
							class="opacity-50 italic whitespace-nowrap text-17px"
							>Tap to type any number here.</span
						>
					{/if}
				</div>
			</div>
		</div>

		<!-- output -->
		<div class="text-[26px] text-center text-blue-400 h-full max-h-full overflow-y-scroll">&nbsp;{output}&nbsp;</div>

		<!-- digit counter -->
		<div
			class=" lg-block absolute top-5 right-4 text-right {atMaxDigits
				? 'text-red-400 font-bold'
				: 'text-yellow-600'}"
		>
			# digits: {digitCount}{#if atMaxDigits}&nbsp;(max){/if}
		</div>
	</div>

	<!-- right column: keypad -->
	<div
		class="w-full flex justify-center items-end lg-pb-16 sm:absolute sm:bottom-0 sm:right-0 pb-4 sm:pb-24 sm:items-end"
	>
		<div
			class="flex flex-col w-full max-w-[60vw] sm:max-w-[20em] gap-2 sm:gap-y-2"
		>
			<!-- increment / decrement -->
			<div class="flex justify-center gap-4 sm:gap-x-4 text-1.25em">
				<button
					aria-label="subtract one"
					class="aspect-square w-2em h-2em flex-none rounded-full border flex justify-center items-center hover:bg-white/5 transition-colors active:bg-white border"
					onclick={() => addToNumber(-1n)}
				>
					-1
				</button>
				<button
					aria-label="clear"
					class="w-2em h-2em flex-none text-red-500 rounded-full border border-red-500 aspect-square flex justify-center items-center hover:bg-red-500/5 transition-colors active:bg-red-500 border"
					onclick={clear}
				>
					c
				</button>
				<div class="inline-flex justify-center">
					<button
						aria-label="read number aloud"
						class="rounded-full border border-blue-400 text-blue-400 px-4 py-1  flex items-center gap-x-2 hover:bg-blue-400/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent border"
						disabled={!digits}
						onclick={speakOutput}
					>
						<!-- <span aria-hidden="true">🔊</span> -->
						<span>read</span>
					</button>
				</div>
				<button
					aria-label="add one"
					class="aspect-square w-2em h-2em flex-none rounded-full border py-1 flex justify-center items-center hover:bg-white/5 transition-colors active:bg-white border"
					onclick={() => addToNumber(1n)}
				>
					+1
				</button>
			</div>
		</div>
	</div>
</main>

<style>
	/* blinking caret shown in the display shim, since the real
	   textarea is transparent and its native caret is invisible */
	.caret {
		display: inline-block;
		width: 0.06em;
		height: 1em;
		margin-left: 0.04em;
		background: currentColor;
		vertical-align: -0.1em;
		animation: caret-blink 1.1s steps(2, start) infinite;
	}
	@keyframes caret-blink {
		to {
			visibility: hidden;
		}
	}
</style>
