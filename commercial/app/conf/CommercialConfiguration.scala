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

  object soulmatesApi {
    private lazy val apiUrl: Option[String] = configuration.getStringProperty("soulmates.api.url")
    lazy val mixedUrl = apiUrl map (url => s"$url/popular/")
    lazy val menUrl = apiUrl map (url => s"$url/popular/men")
    lazy val womenUrl = apiUrl map (url => s"$url/popular/women")
    lazy val gayUrl = apiUrl map (url => s"$url/popular/gay")
    lazy val lesbianUrl = apiUrl map (url => s"$url/popular/lesbian")
  }

}
