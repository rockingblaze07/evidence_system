import React from "react";
import i18n from "../i18n";

function LanguageSelector() {
  return (
    <div>
      <button onClick={() => i18n.changeLanguage("en")}>English</button>
      <button onClick={() => i18n.changeLanguage("hi")}>Hindi</button>
      <button onClick={() => i18n.changeLanguage("ta")}>Tamil</button>
    </div>
  );
}

export default LanguageSelector;
