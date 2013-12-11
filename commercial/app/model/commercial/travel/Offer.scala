package model.commercial.travel

import org.joda.time.DateTime
import model.commercial.Utils._
import model.commercial.{Ad, Keyword, Segment}
import common.{Logging, ExecutionContexts, AkkaAgent}
import scala.concurrent.Future
import scala.concurrent.duration._
import akka.util.Timeout

case class Offer(id: Int, title: Option[String], offerUrl: String, imageUrl: String, fromPrice: String,
                 earliestDeparture: DateTime, keywords: List[Keyword], countries: List[String], duration: String)
  extends Ad {

  def isTargetedAt(segment: Segment): Boolean = {
    val someKeywordsMatch = intersects(keywords.map(_.name), segment.context.keywords)
    segment.context.isInSection("travel") && someKeywordsMatch
  }

  def durationInWords: String = duration match {
    case "1" => return "1 night"
    case x => return s"$x nights"
  }

}

object Countries extends ExecutionContexts with Logging {

  private lazy val countryKeywords = AkkaAgent(Map.empty[String, Seq[Keyword]])

  private val defaultCountries = Seq(
    "Albania",
    "Argentina",
    "Armenia",
    "Austria",
    "Belgium",
    "Bolivia",
    "Botswana",
    "Brazil",
    "Bulgaria",
    "Cambodia",
    "Canada",
    "China",
    "Croatia",
    "Cuba",
    "Czech Republic",
    "Denmark",
    "Ecuador",
    "Egypt",
    "Estonia",
    "Ethiopia",
    "Faroe Islands",
    "Finland",
    "France",
    "Georgia",
    "Germany",
    "Greece",
    "Hong Kong",
    "Hungary",
    "Iceland",
    "India",
    "Iran",
    "Ireland",
    "Italy",
    "Japan",
    "Jordan",
    "Latvia",
    "Lithuania",
    "Madagascar",
    "Malaysia",
    "Malta",
    "Mongolia",
    "Morocco",
    "Myanmar",
    "Namibia",
    "Nepal",
    "Netherlands",
    "Norway",
    "Oman",
    "Peru",
    "Poland",
    "Portugal",
    "Romania",
    "Slovakia",
    "South Africa",
    "Spain",
    "Sri Lanka",
    "Sweden",
    "Switzerland",
    "Thailand",
    "Tunisia",
    "Turkey",
    "United Kingdom",
    "United States",
    "Uruguay",
    "Uzbekistan",
    "Vietnam"
  )

  private implicit val timeout: Timeout = 10.seconds

  def refresh() = {
    val countries = {
      val currentAds = AllOffersAgent.currentAds
      if (currentAds.isEmpty) defaultCountries
      else currentAds.flatMap(_.countries).distinct
    }
    Future.sequence {
      countries map {
        country => Keyword.lookup("\"" + country + "\"", section = Some("travel")) flatMap {
          keywords => countryKeywords.alter(_.updated(country, keywords))
        }
      }
    }
  }

  def stop() {
    countryKeywords.close()
  }


  def forCountry(name: String) = countryKeywords().get(name).getOrElse(Nil)
}
