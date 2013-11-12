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
  }

  object soulmatesApi {
    lazy val mixedUrl = configuration.getStringProperty("soulmates.api.mixed.url")
    lazy val menUrl = configuration.getStringProperty("soulmates.api.men.url")
  }

}
