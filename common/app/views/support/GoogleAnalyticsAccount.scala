package views.support

import conf.Configuration.environment

object GoogleAnalyticsAccount {

  private val prod = "UA-78705427-1"
  private val test = "UA-33592456-1"
  private val useMainAccount = environment.isProd && !environment.isPreview

  val account: String = if (useMainAccount) prod else test

}
