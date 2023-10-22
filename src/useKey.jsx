import { useEffect } from "react";

function Usekey(key, action) {
   useEffect(() => {
      function callback(e) {
         if (e.code.tolowerCase() === key.tolowerCase()) {
            action();
         }
      }
      document.addEventListener("keydown", callback);

      return function () {
         document.removeEventListener("keydown", callback);
      };
   }, [action, key]);
}

export { Usekey };
