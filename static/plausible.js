// Plausible analytics launcher.
// Self-hosted so app.html carries no inline scripts, which lets the CSP
// stay strict (script-src 'self' https://plausible.io -- no unsafe-inline).
(() => {
	// queue shim: capture plausible() calls made before the remote script loads
	window.plausible =
		window.plausible ||
		function () {
			(window.plausible.q = window.plausible.q || []).push(arguments);
		};
	window.plausible.init =
		window.plausible.init ||
		function (options) {
			window.plausible.o = options || {};
		};
	window.plausible.init();

	const script = document.createElement("script");
	script.src = "https://plausible.io/js/pa-nIIBhaahv98-nvxRAUjSX.js";
	script.async = true;
	script.id = "plausible-script";
	document.head.appendChild(script);
})();
