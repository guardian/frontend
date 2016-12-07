package common.commercial

import common.Logging
import conf.Configuration.commercial.{dfpAccountId, dfpAdUnitGuRoot}

object AdUnitMaker extends Logging {

  def make(pageId: String, adUnitSuffix: String): String = {

    def isBadlyFormed(adUnit: String): Boolean = adUnit.contains("//")

    val adUnit = s"/$dfpAccountId/$dfpAdUnitGuRoot/$adUnitSuffix/ng"
    if (isBadlyFormed(adUnit)) {
      // These situation arises when the CAPI content item has no section field.
      // It is usually because the item is part of global. It will have a sectionId set to "global", but no section object.
      // Eg. "global/2016/oct/09/zen-and-the-art-of-korean-vegan-cooking"
      log.warn(s"Bad ad unit '/$dfpAdUnitGuRoot/$adUnitSuffix' on page '$pageId'. Using default ad unit: /$dfpAccountId/$dfpAdUnitGuRoot")
      s"/$dfpAccountId/$dfpAdUnitGuRoot"
    } else {
      adUnit
    }
  }
}
