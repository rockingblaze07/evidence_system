let translations = {};
let currentLanguage =
    localStorage.getItem("i18nextLng") || "en";


async function loadLanguage(language) {

    try {

        const response =
            await fetch(
                `locales/${language}.json`
            );

        translations =
            await response.json();

        currentLanguage =
            language;

        localStorage.setItem(
            "i18nextLng",
            language
        );

        translatePage();

    } catch (error) {

        console.error(
            "Could not load language:",
            error
        );
    }
}


function getTranslation(
    key,
    fallback = key
) {

    const parts =
        key.split(".");

    let value =
        translations;

    for (const part of parts) {

        if (
            value &&
            Object.prototype.hasOwnProperty.call(
                value,
                part
            )
        ) {

            value =
                value[part];

        } else {

            return fallback;
        }
    }

    return value;
}


function translatePage() {

    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key =
                element.dataset.i18n;

            element.textContent =
                getTranslation(
                    key,
                    element.textContent
                );
        });


    const languageSelect =
        document.getElementById(
            "languageSelect"
        );

    if (languageSelect) {

        languageSelect.value =
            currentLanguage;
    }
}


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadLanguage(
            currentLanguage
        );

        const languageSelect =
            document.getElementById(
                "languageSelect"
            );

        if (languageSelect) {

            languageSelect.addEventListener(
                "change",
                event => {

                    loadLanguage(
                        event.target.value
                    );
                }
            );
        }
    }
);