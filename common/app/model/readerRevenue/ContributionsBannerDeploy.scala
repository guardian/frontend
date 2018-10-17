package model.readerRevenue

import org.joda.time.DateTime
import play.api.libs.json._


case class ContributionsBannerDeploy(time: DateTime)

object ContributionsBannerDeploy {
  Format(JodaReads.jodaDateReads("yyyy-MM-dd'T'HH:mm:ssZ"), JodaWrites.jodaDateWrites("yyyy-MM-dd'T'HH:mm:ssZ"))
  implicit val deployFormat: OFormat[ContributionsBannerDeploy] = Json.format[ContributionsBannerDeploy]

}


