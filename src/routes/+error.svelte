<script lang="ts">
// sveltekit error page documentation here:
// https://kit.svelte.dev/docs/routing#error
import { page } from "$app/state";

// components
import ButtonLink from "$components/ButtonLink.svelte";
</script>

<div
	class="grid h-screen w-screen grid-cols-1 place-content-center place-items-center bg-primary text-neutral-100"
>
	<div class="text-[36px] mb-2 text-accent">
		<span>{page.status}</span><span>:&nbsp;</span><span
			>{page.error?.message}</span
		>
	</div>
	<div class="mb-24">Looks like you hit a dead end. Sorry about that.</div>

	<div>
		<ButtonLink href="/" title="Go Home" class="mb-16 sm:mb-24"
			>Go Home</ButtonLink
		>
	</div>
</div>
