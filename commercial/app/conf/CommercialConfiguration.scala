package conf

import com.gu.conf.ConfigurationFactory
import org.joda.time.format.DateTimeFormat

object CommercialConfiguration {

  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  object travelOffersApi {
    lazy val url = configuration.getStringProperty("traveloffers.api.url")
  }

  object jobsApi {

    private val dateFormat = DateTimeFormat.forPattern("yyyy-MM-dd")

    lazy val url = configuration.getStringProperty("jobs.api.url")
    lazy val key = configuration.getStringProperty("jobs.api.key")
    lazy val lightFeedUrl = {
      val feedDate = dateFormat.print(System.currentTimeMillis)
      configuration.getStringProperty("jobs.api.lightfeedurl.template") map {
        _ replace("${feedDate}", feedDate)
      }
    }
  }

}
