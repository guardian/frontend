package views.support

import conf.Configuration.environment
import model.Page
import conf.switches.Switches.GoogleAnalyticsSwitch

object GoogleAnalyticsAccount {

  private val prod = "UA-33592456-1"
  private val test = "UA-75852724-1"
  private val useMainAccount = environment.isProd && !environment.isPreview

  val account: String = if (useMainAccount) prod else test

  /*
  Free version of Google Analytics has rate limits.

  https://developers.google.com/analytics/devguides/collection/ios/v3/limits-quotas

  shouldTrack() & sampleSize should work together to keep us inside those during the test period.
  */
  def shouldTrack(page: Page): Boolean = GoogleAnalyticsSwitch.isSwitchedOn &&
    "sport".equalsIgnoreCase(page.metadata.section)

  // i.e. "One in every X page views"
  val sampleSize: Int = if (useMainAccount) 20 else 1

}
