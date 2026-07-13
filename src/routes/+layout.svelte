<script lang="ts">
// css
import "uno.css";

// types
import type { Snippet } from "svelte";

interface Props {
	children?: Snippet;
}
let { children }: Props = $props();
</script>

{@render children?.()}

<footer
	class="hidden lg-fixed bottom-0 right-0 p-4 text-right text-[13px] text-neutral-100/60"
>
	Made by Kevin Peckham @
	<a
		class="underline-offset-2 hover:underline hover:text-accent"
		href="https://www.lightningjar.com"
		rel="noopener"
		target="_blank">Lightning Jar</a
	>
	in Philadelphia
</footer>
