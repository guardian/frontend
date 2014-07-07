package model.commercial.travel

import org.joda.time.format.DateTimeFormat
import scala.xml.{Elem, Node}
import model.commercial.XmlAdsApi
import conf.{Switches}
import scala.concurrent.Future
import services.S3
import conf.Configuration.commercial._

object TravelOffersApi extends XmlAdsApi[TravelOffer] {

  protected val adTypeName = "Travel Offers"

  protected val switch = Switches.TravelOffersFeedSwitch

  protected val url = Some(travelOffersS3Key)

  override protected val loadTimeout = 30000

  private val dateFormat = DateTimeFormat.forPattern("dd-MMM-yyyy")

  private def buildOffer(node: Node): TravelOffer = {

    def textValue(nodeName: String): String = (node \ nodeName).text.trim()

    def textValues(nodeName: String): List[String] = (node \ nodeName).map(_.text.trim()).toList

    TravelOffer(
      textValue("prodId").toInt,
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

  def parse(xml: Elem): Seq[TravelOffer] = (xml \\ "offer") map buildOffer

  override def loadAds(): Future[Seq[TravelOffer]] = doIfSwitchedOn {
    url map  { u=>
      val reply: Option[String] = S3.get(u)
      val result: Seq[TravelOffer] = reply.fold(Seq[TravelOffer]()) {r =>
        val elems = transform(r)
        parse(elems)
      }
      Future(result)
    } getOrElse Future(Nil)
  }
  

}
