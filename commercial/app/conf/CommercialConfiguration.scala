package conf

import com.gu.conf.ConfigurationFactory

object CommercialConfiguration {

  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  object travelOffersApi {
    lazy val url = configuration.getStringProperty("traveloffers.api.url")
  }

  object jobsApi {
    lazy val url = configuration.getStringProperty("jobs.api.url")
    lazy val key = configuration.getStringProperty("jobs.api.key")
    lazy val lightFeedUrl = configuration.getStringProperty("jobs.api.lightfeedurl")
  }

}
