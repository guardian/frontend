package model.commercial.travel

import scala.concurrent.Future
import common.Logging
import org.joda.time.format.DateTimeFormat
import scala.xml.{Elem, Node}
import conf.CommercialConfiguration
import model.commercial.XmlAdsApi

object OffersApi extends XmlAdsApi[Offer] with Logging {

  val adTypeName = "Travel Offers"

  override protected val loadTimeout = 20000

  private val dateFormat = DateTimeFormat.forPattern("dd-MMM-yyyy")

  private def buildOffer(id: Int, node: Node): Offer = {
    Offer(
      id,
      Some((node \\ "title").text),
      (node \\ "offerurl").text,
      (node \\ "imageurl").text,
      (node \ "@fromprice").text.replace(".00", ""),
      dateFormat.parseDateTime((node \ "@earliestdeparture").text),
      Nil,
      (node \\ "country").map(_.text).toList
    )
  }

  def parse(xml: Elem): Seq[Offer] = {
    (xml \\ "offer").zipWithIndex map {
      case (offerXml, idx) => buildOffer(idx, offerXml)
    }
  }

  def getAllOffers: Future[List[Offer]] = loadAds {
    CommercialConfiguration.travelOffersApi.url
  } map (_.toList)
}
