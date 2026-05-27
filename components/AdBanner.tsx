/**
 * Banner AdMob da mettere sopra la tab bar.
 * Altezza standard ~50px — la tab bar deve avere paddingBottom adeguato.
 *
 * Uso:
 *   <AdBanner />
 */

import React from "react";
import { View, StyleSheet } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { AD_UNIT_BANNER } from "../lib/ads";

export default function AdBanner() {
  return (
    <View style={styles.wrapper}>
      <BannerAd
        unitId={AD_UNIT_BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    backgroundColor: "#000",   // sfondo nero durante il caricamento
  },
});
