// Binary modules bundled by @cloudflare/vite-plugin (CompiledWasm and Data rules).
declare module "*.wasm" {
	const module: WebAssembly.Module;
	export default module;
}
declare module "*.bin" {
	const data: ArrayBuffer;
	export default data;
}
