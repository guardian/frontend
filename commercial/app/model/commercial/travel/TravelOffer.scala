package model.commercial.travel

import akka.util.Timeout
import common.{AkkaAgent, ExecutionContexts, Logging}
import model.commercial.{Segment, _}
import org.joda.time.DateTime

import scala.concurrent.Future
import scala.concurrent.duration._

case class TravelOffer(id: Int, title: String, offerUrl: String, imageUrl: String, fromPrice: String,
                 earliestDeparture: DateTime, keywordIds: List[String], countries: List[String], category: String,
                 tags: List[String], duration: String, position: Int) {

  def isTargetedAt(segment: Segment): Boolean = {
    val someKeywordsMatch = intersects(lastPart(keywordIds), segment.context.keywords)
    segment.context.isInSection("travel") && someKeywordsMatch
  }

  def durationInWords: String = duration match {
    case "1" => "1 night"
    case x => s"$x nights"
  }

}

object Countries extends ExecutionContexts with Logging {

  private lazy val countryKeywordIds = AkkaAgent(Map.empty[String, Seq[String]])

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

  def refresh(): Future[Seq[Map[String, Seq[String]]]] = {
    val countries = {
      val currentAds = TravelOffersAgent.available
      if (currentAds.isEmpty) defaultCountries
      else currentAds.flatMap(_.countries).distinct
    }
    Future.sequence {
      countries map {
        country =>
          Lookup.keyword("\"" + country + "\"", section = Some("travel")) flatMap {
            keywords => countryKeywordIds.alter(_.updated(country, keywords.map(_.id)))
          }
      }
    }
  }

  def forCountry(name: String) = countryKeywordIds().getOrElse(name, Nil)
}
