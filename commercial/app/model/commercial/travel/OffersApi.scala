package model.commercial.travel

import org.joda.time.format.DateTimeFormat
import scala.xml.{Elem, Node}
import model.commercial.XmlAdsApi
import conf.{Switches, CommercialConfiguration}

trait OffersApi extends XmlAdsApi[Offer] {

  protected val switch = Switches.TravelOffersFeedSwitch

  protected val path: String

  protected val url = CommercialConfiguration.getProperty("traveloffers.api.url") map (u => s"$u/$path")

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
}


object AllOffersApi extends OffersApi {
  protected val adTypeName = "All Travel Offers"
  protected lazy val path = "xmloffers"
}


object MostPopularOffersApi extends OffersApi {
  protected val adTypeName = "Most Popular Travel Offers"
  protected lazy val path = "xmlmostpopular"
}
