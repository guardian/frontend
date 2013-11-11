package model.commercial.travel

import common.{ExecutionContexts, Logging}
import scala.concurrent.Future
import conf.ContentApi
import model.commercial.{AdAgent, Keyword}

object OffersAgent extends AdAgent[Offer] with Logging with ExecutionContexts {

  def refresh() {

    def tagAssociatedCountries(offers: List[Offer]): Future[Map[String, List[Keyword]]] = {

      def tagCountryBatch(countries: List[String]): Future[Map[String, List[Keyword]]] = {
        val q = countries mkString( """"""", """" """", """"""") replace("&", "") replace(",", "")
        ContentApi.tags.
          stringParam("type", "keyword").
          stringParam("section", "travel").
          stringParam("q", q).
          pageSize(countries.size).response map {
          response =>
            val keywords = response.results map (tag => Keyword(tag.id, tag.webTitle))
            countries.foldLeft(Map[String, List[Keyword]]()) {
              (countryKeywords, country) =>
                countryKeywords + (country -> keywords.filter(keyword => keyword.webTitle == country))
            }
        }
      }

      val countries = offers.flatMap(offer => offer.countries).distinct
      for {
        batches <- Future.sequence {
          countries.grouped(50).toList.map(tagCountryBatch)
        }
      } yield batches.foldLeft(Map[String, List[Keyword]]())((combined, batch) => combined ++ batch)
    }

    def tagOffers(offers: List[Offer], countryTags: Map[String, List[Keyword]]): List[Offer] = {
      offers.foldLeft(List[Offer]()) {
        case (soFar, offer) =>

          val tags = countryTags.filter {
            case (country, _) => offer.countries.contains(country)
          }.values.flatten.toList

          soFar find (_.id == offer.id) match {
            case Some(o) =>
              val updated = o.copy(keywords = o.keywords ++ tags)
              soFar.updated(soFar.indexOf(o), updated)
            case None =>
              soFar :+ offer.copy(keywords = tags)
          }
      }
    }

    OffersApi.getAllOffers() onSuccess {
      case untaggedOffers =>
        log info s"Loaded ${untaggedOffers.size} travel offers"
        tagAssociatedCountries(untaggedOffers) onSuccess {
          case countryTags =>
            val offers = tagOffers(untaggedOffers, countryTags)
            log info s"Tagged ${offers.size} travel offers"
            updateCurrentAds(offers)
        }
    }
  }

}
