package model.commercial.travel

import scala.concurrent.Future
import org.joda.time.format.DateTimeFormat
import scala.xml.{Elem, Node}
import model.commercial.XmlAdsApi
import conf.CommercialConfiguration

object OffersApi extends XmlAdsApi[Offer] {

  protected val adTypeName = "Travel Offers"

  private lazy val url = CommercialConfiguration.getProperty("traveloffers.api.url")
  private lazy val allUrl = url map (u => s"$u/xmloffers")
  private lazy val mostPopularUrl = url map (u => s"$u/xmlmostpopular")

  override protected val loadTimeout = 30000

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
      (node \\ "country").map(_.text).toList,
      (node \ "@duration").text
    )
  }

  def parse(xml: Elem): Seq[Offer] = {
    (xml \\ "offer").zipWithIndex map {
      case (offerXml, idx) => buildOffer(idx, offerXml)
    }
  }

  def getAllOffers: Future[List[Offer]] = loadAds(allUrl) map (_.toList)

  def getMostPopularOffers: Future[List[Offer]] = loadAds(mostPopularUrl) map (_.toList)
}
