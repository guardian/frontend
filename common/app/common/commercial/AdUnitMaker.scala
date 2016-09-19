package common.commercial

import common.Logging
import conf.Configuration.commercial.{dfpAccountId, dfpAdUnitGuRoot}

object AdUnitMaker extends Logging {

  def make(pageId: String, adUnitSuffix: String): String = {

    def isBadlyFormed(adUnit: String): Boolean = adUnit.contains("//")

    val adUnit = s"/$dfpAccountId/$dfpAdUnitGuRoot/$adUnitSuffix/ng"
    if (isBadlyFormed(adUnit)) {
      log.error(s"Bad ad unit '$dfpAdUnitGuRoot/$adUnitSuffix' on page '$pageId'")
      s"/$dfpAccountId/$dfpAdUnitGuRoot"
    } else {
      adUnit
    }
  }
}
