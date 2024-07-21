// prefer explicit re-exporting:
// - vs. wildcard re-exporting ... ex: export * from "... snip snip";
// - as it excludes any unused functions, reducing the overall bundle size

// firebase auth
import {getAuth,
        onAuthStateChanged,
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// accumulated exports
export {getAuth,
        onAuthStateChanged,
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword};
