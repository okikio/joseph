import { el } from "./ele";

// Window element Object
export let _global = el(window);
export let _document = el(document);
export let _body = el("html, body");
export default _global;