package model.travel.service

import common.{AkkaAgent, ExecutionContexts, Logging}
import model.travel.{Keyword, Offer}
import scala.concurrent.Future
import conf.ContentApi

object OffersAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, Seq[Offer]]](Map.empty)

  def allOffers: Seq[Offer] = agent().get("offers").getOrElse(Nil)

  def refresh() {

    // TODO: reduce num of calls to content API
    //   def tag(offers: Seq[Offer]): Future[Seq[Offer]] = {
    def tag(offer: Offer): Future[Offer] = {
      val countries = offer.countries mkString( """"""", """" """, """"""") replace("&", "") replace(",", "")
      println(countries)
      val response = ContentApi.tags.
        stringParam("type", "keyword").
        stringParam("section", "travel").
        stringParam("q", countries).response
      response map {
        _.results map (tag => Keyword(tag.id, tag.webTitle))
      } map (keywords => offer.copy(keywords = keywords))
    }

    OffersApi.getAllOffers onSuccess {
      case offers =>
        log.info(s"Loaded ${offers.size} travel offers")
        tag(offers(0)) map {
          taggedOffer =>
            println(taggedOffer.keywords)
            val taggedOffers = Seq(taggedOffer)
            log.info(s"Tagged ${taggedOffers.size} travel offers")
            agent send Map("offers" -> taggedOffers)
        }
    }
  }

}
