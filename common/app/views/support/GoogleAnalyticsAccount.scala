package views.support

import conf.Configuration.environment

object GoogleAnalyticsAccount {

  private val prod = "UA-33592456-1"
  private val test = "UA-75852724-1"
  private val useMainAccount = environment.isProd && !environment.isPreview

  val account: String = if (useMainAccount) prod else test

  // Percentage of traffic to track
  // Note there are rate limits in the free version
  // https://developers.google.com/analytics/devguides/collection/ios/v3/limits-quotas
  val sampleRate: Int = if (useMainAccount) 1 else 100

}
