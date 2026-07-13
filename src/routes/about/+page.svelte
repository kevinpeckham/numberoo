<svelte:head>
	<title>About | Numberoo</title>
	<meta
		content="The story behind Numberoo: a kindergartner's question about how big numbers get, and why a googol doesn't fit in a JavaScript number."
		name="description"
	/>
</svelte:head>

<main class="min-h-screen w-full page-x-padding py-8 sm:py-12">
	<article class="mx-auto max-w-[42em] leading-relaxed">
		<a
			class="inline-block mb-8 text-blue-300 hover:underline underline-offset-4"
			href="/">&larr; back to Numberoo</a
		>

		<h1 class="text-28px font-bold text-blue-300 mb-6">About Numberoo</h1>

		<p class="mb-4">
			Numberoo began with a kindergartner's question: <em
				>how big can numbers get?</em
			> Leo came home from school fascinated by the googol (a one followed by one
			hundred zeros) and he wanted to see it. Not hear about it. See it, hear its
			name said out loud, and then change one digit and hear the new name.
		</p>

		<p class="mb-4">
			So I built him this toy. Type digits and the page names the number in
			English, all the way up to one googol, and reads it aloud if you press the
			button. It is the smallest open-source project we maintain: a single page
			and a single utility module.
		</p>

		<h2 class="text-20px font-bold text-blue-300 mt-8 mb-4">
			The number that doesn't fit in a number
		</h2>

		<p class="mb-4">
			A googol does not fit in a JavaScript number. Every number in JavaScript
			is a 64-bit float that can only represent integers exactly up to about
			nine quadrillion — roughly ninety digits short of the destination. Past
			that boundary, integers don't error; they silently round.
		</p>

		<p class="mb-4">
			Numberoo's fix is to never convert your input at all. The digit string
			<em>is</em> the data structure. The engine scrubs the input to bare digits,
			splits it into triplets, names each triplet with the vocabulary every kid
			learns, and attaches scale words up a thirty-four entry table that ends at
			duotrigintillion (10<sup>99</sup>). There is no arithmetic anywhere in the
			file — so the precision bugs that haunt big numbers have nothing to attach
			to.
		</p>

		<p class="mb-4">
			The voice is the browser's own Web Speech API: no audio files, no
			service, no dependency. A five-year-old types a one and then holds down
			the zero key, and the browser solemnly reads him <em
				>four quattuorvigintillion</em
			>. This is, reliably, the funniest thing either of us has heard all week.
		</p>

		<h2 class="text-20px font-bold text-blue-300 mt-8 mb-4">Read more</h2>

		<ul class="list-disc pl-6 mb-8">
			<li class="mb-2">
				<a
					class="text-blue-300 hover:underline underline-offset-4"
					href="https://www.lightningjar.com/blog/the-number-that-doesnt-fit-in-a-number"
					rel="noopener"
					target="_blank"
					>The Number That Doesn't Fit in a Number — the full essay</a
				>
			</li>
			<li class="mb-2">
				<a
					class="text-blue-300 hover:underline underline-offset-4"
					href="https://github.com/kevinpeckham/numberoo"
					rel="noopener"
					target="_blank">Numberoo on GitHub</a
				>
			</li>
		</ul>

		<p class="opacity-70 text-15px">
			Made by Kevin Peckham @
			<a
				class="hover:underline underline-offset-2 hover:text-accent"
				href="https://www.lightningjar.com"
				rel="noopener"
				target="_blank">Lightning Jar</a
			>
			in Philadelphia.
		</p>
	</article>
</main>
