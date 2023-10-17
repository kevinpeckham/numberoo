
<script lang="ts">

	// data
	const numbers: { [key:string]: string;} = {
			'0': 'zero',
			'1': 'one',
			'2': 'two',
			'3': 'three',
			'4': 'four',
			'5': 'five',
			'6': 'six',
			'7': 'seven',
			'8': 'eight',
			'9': 'nine',
			'10': 'ten',
			'11': 'eleven',
			'12': 'twelve',
			'13': 'thirteen',
			'14': 'fourteen',
			'15': 'fifteen',
			'16': 'sixteen',
			'17': 'seventeen',
			'18': 'eighteen',
			'19': 'nineteen',
			'20': 'twenty',
			'30': 'thirty',
			'40': 'forty',
			'50': 'fifty',
			'60': 'sixty',
			'70': 'seventy',
			'80': 'eighty',
			'90': 'ninety',
			'100': 'hundred',
			'1000': 'thousand',
			'm1': 'thousand',
			'm2': 'million',
			'm3': 'billion',
			'm4': 'trillion',
			'm5': 'quadrillion',
			'm6': 'quintillion',
			'm7': 'sextillion',
			'm8': 'septillion',
			'm9': 'octillion',
			'm10': 'nonillion',
			'm11': 'decillion',
			'm12': 'undecillion',
			'm13': 'duodecillion',
			'm14': 'tredecillion',
			'm15': 'quattuor-decillion',
			'm16': 'quindecillion',
			'm17': 'sexdecillion',
			'm18': 'septen-decillion',
			'm19': 'octodecillion',
			'm20': 'novemdecillion',
			'm21': 'vigintillion',
			'm22': 'unvigintillion',
			'm23': 'duovigintillion',
			'm24': 'trevigintillion',
			'm25': 'quattuorvigintillion',
			'm26': 'quinvigintillion',
			'm27': 'sexvigintillion',
			'm28': 'septen-vigintillion',
			'm29': 'octovigintillion',
			'm30': 'novemvigintillion',
			'm31': 'trigintillion',
			'm32': 'untrigintillion',
			'm33': 'duotrigintillion', // 10 duotrigintillion == 1 googol



	}


	// variables
	let input = '1';
	let output = 'one';
	let digitCounter = '1';

	// when input changes, update inputEl value
	$: if (inputEl) inputEl.textContent = '8';

	// refs
	let shim: HTMLDivElement;
	let inputEl: HTMLTextAreaElement;


	function scrubInput(str: string) {

		// remove all characters that aren't numbers
		const numbersOnly = str.replace(/[^0-9]/g, '');

		// limit length to 101 characters
		const limited = numbersOnly.slice(0, 101);

		return limited;
	}

	// prevent default on any key except numbers or tab or backspace
	function onKeydown(e: KeyboardEvent) {
		const allowed: {[key:string]: boolean} = {
			"Tab": true,
			"Escape": true,
			"Backspace": true,
			"ArrowRight": true,
			"ArrowLeft": true,
			"ArrowUp": true,
			"ArrowDown": true,
		}

		// allow numbers
		if ( Number(e.key) >= 0 ) null

		// allow select keys
		else if (allowed[e.key]) null

		// disallow all other keys
		else e.preventDefault();

	};

	function onInput(e: KeyboardEvent) {
		const target = e.target as HTMLInputElement;
		const value = target.value;

		// remove all characters except numbers
		const scrubbed = scrubInput(value)

		// add commas per US number formatting
		const commasAdded = addCommas(scrubbed)

		// update input with formatted number
		target.value = commasAdded
		input = commasAdded;

		output = convertNumber(scrubbed)

		digitCounter = `${scrubbed.length}`;

	}

	// function to divide string into an array of three-character groups
	function breakStringIntoGroupsOfThree(str: string) {
		const groups = [];
		for (let i = 0; i < str.length; i += 3) {
			groups.push(str.slice(i, i + 3));
		}
		return groups;
	}

	// function to add zeros to the beginning of a string until it's length is divisible by three
	function padStringWithZeros(str: string) {
		let padded = str.replace(/,/g, '');
		while (padded.length % 3 !== 0) {
			padded = '0' + padded;
		}
		return padded;
	}


	function convertNumber(numString: string) {
		const padded = padStringWithZeros(numString);
		const array = breakStringIntoGroupsOfThree(padded);
		const result = translateArrayOfTriplets(array);

		const adjustedForGoogol = result.replace('ten duotrigintillion', 'one googol');
		return adjustedForGoogol;
	}

	// function to translate the ones place digit and terminology of a three-digit number
	// (e.g. '123') -> ['three', '3']
	function translate0Digit(str: string) {
		const digit = str ? str[str.length - 1] : '' ?? '';
		const term = digit ? numbers[digit] : '';
		return [term, digit];
	}
	// function to translate the tens place digit and terminology of a three-digit number
	// (e.g. '123') -> ['twenty', '2']
	function translate00Digit(str: string) {
		const digit = str ? str[str.length - 2] : '' ?? '';
		const term = digit ? numbers[digit + '0'] : '';
		return [term, digit];
	}
	// function to translate the hundreds place digit of a three-digit number
	// (e.g. '123') -> ['one', '1']
	function translate000Digit(str: string) {
		const digit = str ? str[str.length - 3] : '' ?? '';
		const term = digit ? numbers[digit] : '';
		return [term, digit];
	}
	function translateTriplet(triplet: string) {
		const [term000, digit000] = translate000Digit(triplet);
		const [term00, digit00] = translate00Digit(triplet);
		const [term0, digit0] = translate0Digit(triplet);
		const number = Number(triplet);

		// get the term for the last two digits
		let lastTwoTerm = '';
		const lastTwoNumber = (Number(digit00) * 10) + Number(digit0);
		if (lastTwoNumber == 0) lastTwoTerm = ''
		else if (lastTwoNumber <= 20) lastTwoTerm = numbers[`${lastTwoNumber}`]
		else lastTwoTerm = `${term00}-${term0}`;

		// get the term for the first digit
		const firstTerm = Number(digit000) ? `${term000} hundred` : '';

		// return the translated triplet
		return [`${firstTerm} ${lastTwoTerm}`, number];

	}

	function translateArrayOfTriplets(array: string[]) {
		// create deep copy of array and reverse it
		const arrayCopy = JSON.parse(JSON.stringify(array));
		const reversed = arrayCopy.reverse() as string[];

		// translate each triplet in reverse order
		const translated = reversed.map((triplet, index) => {
			// term e.g. 'thousand', 'million', 'billion', etc.
			// const term = index ? numbers[`1${'000'.repeat(index)}`] : '';
			const term = index ? numbers[`m${index}`] : '';

			const words = translateTriplet(triplet)[0];
			// value of triple as a number e.g. 001 -> 1
			const number = translateTriplet(triplet)[1];

			//- only include term if number is greater than zero
			//- because 'zero million' is not a thing
			const result = `${words} ${number ? term : ''}`;

			return result
		});
		// console.log(translated)
		return translated.reverse().join(' ');
	}

	function addCommas(numString: string) {
			// if string is empty, return empty string
			if (!numString) return '';

			// strip commas if any exist
			const noCommas = numString.replace(/,/g, '');
			// deep copy
			const deepCopy = JSON.parse(JSON.stringify(noCommas));
			// reverse copy
			const reversed = deepCopy.split('').reverse();
			// add commas after every third character
			const withCommas = reversed.map((char: string, i: number) => {
				return (i % 3 === 0 && i !== 0) ? char + ',' : char;
			});
			// return formatted string
			return withCommas.reverse().join('');
		}



</script>

<template lang="pug">
	//- head
	svelte:head
		title Numberoo
		meta(
			content="",
			name="description"
		)

	//- body
	main.relative.grid.grid-cols-4.min-h-screen.p-4.w-screen(class="items-start pt-0 sm:p-4 sm:pt-0 sm:place-content-center")

		.mb-4.pt-4(class="sm:pl-8 sm:absolute")
			h1.text-3xl.font-bold.text-blue-300.mb-2 Numberoo
			div.opacity-95.italic read and spell numbers up to one googol

		//- left column
		.col-span-3


				//- input
				.w-full.flex.justify-center.text-center.pb-4.h-auto(class="min-h-[1em]")
					//- container
					.relative.align-text-bottom.text-24.flex.justify-center.items-end.h-full.leading-snug(class="sm:text-48 max-w-[90vw]")
						textarea.opacity-0.absolute.bg-transparent.text-white.text-center.h-full.w-full(
							aria-label="input number",
							auto-focus="true",
							autocomplete="off",
							bind:this!="{inputEl}",

							class="bg-red-100/10 text-red-500 border-white/20 outline-none min-h-[1em] placeholder:whitespace-nowrap placeholder:text-18",
							placeholder="enter number",
							type="text"
							on:input!="{onInput}"
							on:keydown!="{onKeydown}"
							resize="none"
							style!="resize:none; min-width:6ch; min-height:1em;"
						) 1
						div.pointer-events-none.align-text-bottom.h-fit.w-fit.text-center.break-words.px-4.rounded(
							class="bg-blue-500/10 min-w-[6ch] min-h-[1.375em]"
							bind:this!="{shim}"
						) {input}

				//- output
				div.text-26.text-center.text-blue-400 &nbsp;{output}&nbsp;

				//- digit counter
				div.absolute.bottom-8.text-yellow-600.pl-4 # digits: { digitCounter }

		//- right column
		div
			.grid.grid-cols-3.gap-x-4.gap-y-2
				+each('Array(9) as n, index')
					button.rounded-full.border.aspect-square.flex.justify-center.items-center(
						on:click!="{() => {input = `${input}${index + 1}`; inputEl.focus();}}"
						class="hover:bg-white/5 transition-colors active:bg-white") { index + 1 }

				//- backspace
				button.text-red-500.rounded-full.border.border-red-500.aspect-square.flex.justify-center.items-center(
					on:click!="{() => {input = input.slice(0, -1); inputEl.focus();}}"
					class="hover:bg-red-500/5 transition-colors active:bg-red-500"
				) {`<`}

				//- zero
				button.rounded-full.border.aspect-square.flex.justify-center.items-center(
					on:click!="{() => {inputEl.textContent = '7'; inputEl.focus();}}"
					class="hover:bg-white/5 transition-colors active:bg-white") 0

				//- clear
				button.text-red-500.rounded-full.border.border-red-500.aspect-square.flex.justify-center.items-center(
					on:click!="{() => {input = ``; output = ``; inputEl.focus();}}"
					class="hover:bg-red-500/5 transition-colors active:bg-red-500"
				) {`c`}


</template>
