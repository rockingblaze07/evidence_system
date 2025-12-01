import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Home() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng); // persist selection
  };

  return (
    <div className="relative flex justify-center items-center h-[80vh]">
      <div className="blurry-shape absolute -z-10"></div>

      <div className="relative z-10 bg-black/70 p-10 rounded-2xl shadow-lg border border-green-400 text-center">
        <h2 className="text-4xl font-bold font-['Bruno Ace'] text-green-400 mb-4">
          {t("home.welcome")}
        </h2>
        

        <p className="mt-6 text-gray-400 text-sm">
          {t("new_user")}{" "}
          <Link to="/login" className="text-green-400 hover:underline">{t("auth.login")}</Link>{" "}
          or{" "}
          <Link to="/signup" className="text-blue-400 hover:underline">{t("auth.signup")}</Link>
        </p>

        {/* Dropdown at bottom-right corner of the box */}
        <div className="absolute bottom-4 right-4">
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded shadow-lg"
            defaultValue={i18n.language}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Home;
