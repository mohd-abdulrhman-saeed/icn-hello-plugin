package com.training.icn;

import java.util.Locale;

/**
 * Small helper that picks the Arabic or the English text for a locale.
 * ICN passes the user's locale to getName(Locale) and similar methods.
 */
final class HelloText {

    private HelloText() { }

    static boolean isArabic(Locale locale) {
        return locale != null && "ar".equalsIgnoreCase(locale.getLanguage());
    }

    static String pick(Locale locale, String english, String arabic) {
        return isArabic(locale) ? arabic : english;
    }
}
