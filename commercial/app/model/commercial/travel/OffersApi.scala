package model.commercial.travel

import org.joda.time.format.DateTimeFormat
import scala.xml.{Elem, Node}
import model.commercial.XmlAdsApi
import conf.{Switches, CommercialConfiguration}

object OffersApi extends XmlAdsApi[Offer] {

  protected val adTypeName = "Travel Offers"

  protected val switch = Switches.TravelOffersFeedSwitch

  protected val url = CommercialConfiguration.getProperty("traveloffers.api.url") map (u => s"$u/consumerfeed")

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
      textValue("category"),
      textValues("tag"),
      textValue("@duration"),
      textValue("position").toInt
    )
  }

  def parse(xml: Elem): Seq[Offer] = {
    (xml \\ "offer").zipWithIndex map {
      case (offerXml, idx) => buildOffer(idx, offerXml)
    }
  }
}
