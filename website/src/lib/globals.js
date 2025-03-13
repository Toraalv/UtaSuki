import { dev } from "$app/environment";

const API_PORT = dev ? 5900 : 8800;
const CDN_ADDR = dev ? "https://localhost:5900" : "https://cdn.utasuki.toralv.dev";

export { API_PORT, CDN_ADDR };
