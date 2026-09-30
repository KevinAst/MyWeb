// prefer explicit re-exporting:
// - vs. wildcard re-exporting ... ex: export * from "... snip snip";
// - as it excludes any unused functions, reducing the overall bundle size
import {getDatabase, ref, get, set, update, onChildChanged} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
export {getDatabase, ref, get, set, update, onChildChanged};
