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

    def textValue(nodeName: String): String = (node \ nodeName).text.trim()

    def textValues(nodeName: String): List[String] = (node \ nodeName).map(_.text.trim()).toList

    Offer(
      id,
      textValue("prodName"),
      textValue("prodUrl"),
      textValue("prodImage"),
      textValue("@fromprice").replace(".00", ""),
      dateFormat.parseDateTime(textValue("@earliestdeparture")),
      Nil,
      textValues("location"),
      textValue("@duration")
    )
  }

  def parse(xml: Elem): Seq[Offer] = {
    (xml \\ "offer").zipWithIndex map {
      case (offerXml, idx) => buildOffer(idx, offerXml)
    }
  }
}

// TODO remove
object AllOffersApi extends OffersApi {
  protected val adTypeName = "All Travel Offers"
  protected lazy val path = "consumerfeed"
}


// TODO remove
object MostPopularOffersApi extends OffersApi {
  protected val adTypeName = "Most Popular Travel Offers"
  protected lazy val path = "xmlmostpopular"
}
