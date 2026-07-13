// vercel adapter
import { default as vercel } from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const isDev = process.argv.includes("dev");

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Use vitePreprocess for TypeScript support
	preprocess: vitePreprocess(),
	kit: {
		adapter: vercel(),
		alias: {
			$components: "./src/lib/components",
			$data: "./src/lib/data",
			$types: "./src/lib/types",
			$utils: "./src/lib/utils",
		},
		// Strict CSP. The site is fully prerendered, so per-request nonces
		// (the slx-web approach) are impossible; "hash" mode has kit hash its
		// own inline bootstrap script at build time and emit a meta tag.
		// frame-ancestors etc. can't live in a meta CSP -- see vercel.json.
		csp: {
			mode: "hash",
			directives: {
				"base-uri": ["none"],
				"object-src": ["none"],
				"default-src": ["self"],
				// self covers the /plausible.js launcher; plausible.io the tracker
				"script-src": ["self", "https://plausible.io"],
				// unsafe-inline: kit's route announcer and vite's dev-time style
				// injection set styles inline; nonces/hashes don't cover them
				"style-src": ["self", "unsafe-inline"],
				"img-src": ["self", "data:"],
				// plausible.io receives the analytics events; ws: is vite HMR
				"connect-src": isDev
					? ["self", "https://plausible.io", "ws:"]
					: ["self", "https://plausible.io"],
			},
		},
	},
	compilerOptions: {
		discloseVersion: false,
		runes: true,
	},
};

export default config;
