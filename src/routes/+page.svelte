<script lang="ts">
// utils
import {
	MAX_DIGITS,
	addCommas,
	normalizeDigits,
	numberToWords,
} from "$utils/numberToWords";

const GOOGOL_DIGITS = `1${"0".repeat(100)}`;

// state: canonical digit string -- scrubbed, no leading zeros, never empty
let digits = $state("0");

// derived display values
const formatted = $derived(addCommas(digits));
const output = $derived(numberToWords(digits));
const digitCount = $derived(digits.length);
const atMaxDigits = $derived(digitCount >= MAX_DIGITS);

// refs
let inputEl: HTMLTextAreaElement | undefined = $state();

// desktop: when the browser window itself isn't focused the page looks
// ready for input but isn't -- track it so we can hint the user
let windowFocused = $state(true);

// keep the field focused on load so the keyboard is ready --
// especially the native keyboard on mobile
$effect(() => {
	inputEl?.focus();
	windowFocused = document.hasFocus();
});

// stop any in-progress speech; reading a stale number is confusing
function stopSpeech() {
	if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
	if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
}

// single update path shared by typing and the controls
function setDigits(raw: string) {
	stopSpeech();
	digits = normalizeDigits(raw);
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

<svelte:window
	onkeydown={onWindowKeydown}
	onfocus={() => (windowFocused = true)}
	onblur={() => (windowFocused = false)}
/>

<svelte:head>
	<title>Numberoo</title>
	<meta
		content="Read and spell numbers up to one googol -- convert any number into English words."
		name="description"
	/>
</svelte:head>

<main
	class="relative grid grid-cols-1 grid-rows-[auto_1fr_auto] h-screen min-h-screen w-screen items-start page-x-padding py-3 sm-py-4 place-content-start gap-y-1 sm-gap-y-4"
>
	<header class="grid grid-cols-[auto_auto_1fr] lg-grid-cols-[auto_1fr_auto] items-baseline gap-x-2 sm-gap-x-4">
		<h1 class="inline-block text-20px font-bold text-blue-300 mb-2 leading-none">
			Numberoo
		</h1>
		<!-- mobile: info-style link to the about page -->
		<a
			aria-label="About Numberoo"
			class="sm:hidden flex w-16px h-16px rounded-full border border-neutral-100/60 text-neutral-100/80 text-12px justify-center items-center hover:text-accent hover:border-accent transition-colors leading-none"
			href="/about">?</a
		>
		<div class="hidden opacity-95 italic leading-none sm:block">
			read and spell numbers up to <button
				class="italic hover:text-blue-300 hover:underline underline-offset-4 transition-colors"
				onclick={loadGoogol}>one googol</button
			>
		</div>
		<div
			class="text-right {atMaxDigits
				? 'text-red-400 font-bold'
				: 'opacity-80'}"
		>
			# digits: {digitCount}{#if atMaxDigits}&nbsp;(max){/if}
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
					oninput={onInput}
					onkeydown={onKeydown}
					value={formatted}
				></textarea>
				<div
					class="pointer-events-none h-fit text-center sm-text-left break-words px-4 rounded bg-blue-500/10 w-full lg-min-w-[6ch] min-h-1.375em sm-h-130px"
				>
					{formatted}<span
						aria-hidden="true"
						class="caret {windowFocused ? '' : 'caret-idle'}"
					></span>
				</div>
			</div>
		</div>

		<!-- output -->
		<div class="text-[26px] text-center text-blue-400 h-full max-h-full overflow-y-scroll w-full lg-text-left">&nbsp;{output}&nbsp;</div>

		<!-- digit counter -->
		<!-- <div
			class="absolute top-8 right-0 page-x-padding !pl-0 text-right {atMaxDigits
				? 'text-red-400 font-bold'
				: 'text-yellow-600'}"
		>
			# digits: {digitCount}{#if atMaxDigits}&nbsp;(max){/if}
		</div> -->
	</div>

	<!-- right column: keypad -->
	<div
		class="
		flex
		justify-center
		items-end
		pb-4
		w-full
		lg-pb-16
		lg-grid
		lg-grid-cols-1
		lg-place-items-center
		lg-w-full"
	>
		<div
			class="flex flex-col w-full max-w-[60vw] sm:max-w-[20em] gap-2 sm:gap-y-2 lg-w-fit lg-max-w-screen"
		>
			<!-- increment / decrement -->
			<div class="flex justify-center gap-4 sm:gap-x-4 text-1.25em">
				<!-- sm+: room for bigger jumps -- kids love 100 -->
				<button
					aria-label="subtract one hundred"
					class="hidden sm:flex h-2em px-3 flex-none rounded-full border justify-center items-center hover:bg-white/5 transition-colors active:bg-white border"
					onclick={() => addToNumber(-100n)}
				>
					-100
				</button>
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
						class="rounded-full border border-blue-400 text-blue-400 px-4 py-1  flex items-center gap-x-2 hover:bg-blue-400/10 transition-colors border"
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
				<button
					aria-label="add one hundred"
					class="hidden sm:flex h-2em px-3 flex-none rounded-full border justify-center items-center hover:bg-white/5 transition-colors active:bg-white border"
					onclick={() => addToNumber(100n)}
				>
					+100
				</button>

				<!-- mobile: opens the device keyboard; the tap gesture lets
				     focus() summon it, unlike the page-load autofocus -->
				<button
					aria-label="open keyboard"
					class="sm:hidden aspect-square w-2em h-2em flex-none rounded-full border flex justify-center items-center hover:bg-white/5 transition-colors active:bg-white border"
					onclick={() => inputEl?.focus()}
				>
					<span aria-hidden="true">⌨️</span>
				</button>
			</div>
		</div>
		<div class="hidden lg-block italic opacity-80 text-center mt-5">or type numbers on your keyboard</div>
	</div>

	<!-- desktop: about link pinned bottom right, above the footer -->
	<a
		class="hidden sm:block absolute bottom-4 right-4 text-15px text-white opacity-70 hover-opacity-100 underline underline-offset-4"
		href="/about">about</a
	>

	<!-- window-focus overlay: any click returns focus to the window, which
	     dismisses it; the button is the visual affordance and re-focuses
	     the input for good measure -->
	{#if !windowFocused}
		<div
			class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-y-6 bg-primary/60 backdrop-blur-sm text-center"
		>
			<div class="text-20px">Click below to continue.</div>
			<button
				class="rounded-full bg-accent text-primary font-bold px-8 py-2 text-17px hover:opacity-90 transition-opacity"
				onclick={() => inputEl?.focus()}
			>
				Continue
			</button>
		</div>
	{/if}
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
	/* steady, dimmed caret while the browser window is unfocused */
	.caret-idle {
		animation: none;
		opacity: 0.35;
	}
</style>
