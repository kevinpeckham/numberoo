<!--
@component
An <a> styled to look like a button.
- prop href: string -- link target url
- prop title: string -- link title
- prop class: string -- extra classes for the wrapper
- children -- link text
-->
<script lang="ts">
// types
import type { Snippet } from "svelte";

interface Props {
	href?: string;
	title?: string;
	class?: string;
	children?: Snippet;
}
let { href = "#", title = "", class: classes = "", children }: Props = $props();
</script>

<div class="w-full {classes}">
	<a
		class="text-[15px] inline-block rounded bg-transparent px-4 py-2 outline outline-1 outline-neutral-50 transition-all hover:bg-accent hover:text-primary hover:outline-transparent"
		{href}
		{title}
	>
		{@render children?.()}
	</a>
</div>
