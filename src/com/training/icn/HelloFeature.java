package com.training.icn;

import java.util.Locale;
import com.ibm.ecm.extension.PluginFeature;

public class HelloFeature extends PluginFeature {

    @Override public String getId() { return "HelloFeature"; }

    @Override
    public String getName(Locale locale) {
        return HelloText.pick(locale, "Hello Feature", "\u0645\u064a\u0632\u0629 Hello");
    }

    @Override
    public String getDescription(Locale locale) {
        return HelloText.pick(locale, "Hello Plugin demo feature", "\u0645\u064a\u0632\u0629 \u062a\u062c\u0631\u064a\u0628\u064a\u0629 \u0644\u0625\u0636\u0627\u0641\u0629 Hello");
    }

    // CSS class defined in HelloPluginV20.css
    @Override public String getIconUrl() { return "HelloFeatureIcon"; }

    @Override
    public String getFeatureIconTooltipText(Locale locale) {
        return HelloText.pick(locale, "Hello Feature", "\u0645\u064a\u0632\u0629 Hello");
    }

    @Override
    public String getPopupWindowTooltipText(Locale locale) {
        return HelloText.pick(locale, "Hello Feature", "\u0645\u064a\u0632\u0629 Hello");
    }

    // Dojo widget: <module>.<class>
    @Override public String getContentClass() { return "helloPluginDojo.HelloFeature"; }

    // empty = no fly-out menu
    @Override public String getPopupWindowClass() { return ""; }

    @Override public boolean isPreLoad() { return false; }
}
