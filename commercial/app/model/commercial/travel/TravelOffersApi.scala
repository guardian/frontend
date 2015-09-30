package model.commercial.travel

import common.{ExecutionContexts, Logging}
import conf.Configuration.commercial._
import conf.switches.Switches._
import org.joda.time.format.DateTimeFormat
import services.S3

import scala.concurrent.Future
import scala.xml.{Elem, Node, XML}

object TravelOffersApi extends ExecutionContexts with Logging {

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

  def loadAds(): Future[Seq[TravelOffer]] = {
    if (TravelOffersFeedSwitch.isSwitchedOn) {
      val reply: Option[String] = S3.get(travelOffersS3Key)
      val result: Seq[TravelOffer] = reply.fold(Seq[TravelOffer]()) { r =>
        val elems = XML.loadString(r)
        parse(elems)
      }
      Future.successful(result)
    } else {
      log.warn(s"Reading Travel Offers feed failed: Switch is off")
      Future.successful(Nil)
    }
  }

}
