// prefer explicit re-exporting:
// - vs. wildcard re-exporting ... ex: export * from "... snip snip";
// - as it excludes any unused functions, reducing the overall bundle size
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
export {initializeApp};
