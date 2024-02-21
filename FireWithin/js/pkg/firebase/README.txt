*-------------------------------------------------------------------------------
* Firebase Package
*-------------------------------------------------------------------------------

- This module directory is used to centralize the firebase version used in our app.

  * It simply re-exports the firebase functions used in in our app,
    which encapsolates the version in-use (i.e. the imported url).

  * This technique is used in lue of Import Maps, which MY NOT be
    supported by all browsers.
    ... https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#importing_modules_using_import_maps

  * Example:

      import {initializeApp} from "./pkg/firebase/app.js";

      ... under the covers, the import is pulled from:
          https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js

- For current Firebase released, see: 
  ... https://firebase.google.com/support/releases

  * Version 10 was initially RELEASED 07/06/2023
    ... https://firebase.google.com/support/releases#july_06_2023

  * We are currently using v10.7.1, RELEASED 12/05/2023
    ... https://firebase.google.com/support/releases#december_05_2023
