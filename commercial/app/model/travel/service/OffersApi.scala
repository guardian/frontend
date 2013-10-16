package model.travel.service

import play.api.libs.ws.WS
import scala.concurrent.Future
import common.ExecutionContexts
import scala.xml.{Node, XML}
import org.joda.time.format.DateTimeFormat
import model.travel.Offer

object OffersApi extends OffersApi {

  def getOffersRequestBody: Future[String] = WS.url("http://extranet.gho.red2.co.uk/Offers/XmlOffers")
    .withHeaders(("Cache-Control", "public, max-age=1")) withRequestTimeout 20000 get() map {
    response => response.body
  }

}


trait OffersApi extends ExecutionContexts {

  private val dateFormat = DateTimeFormat.forPattern("dd-MMM-yyyy")

  protected def getOffersRequestBody: Future[String]

  def getAllOffers: Future[List[Offer]] = {

    def buildOffer(id: Int, node: Node): Offer = {
      Offer(
        id,
        Some((node \\ "title").text),
        (node \\ "offerurl").text,
        (node \\ "imageurl").text
          .replace("NoResize", "ThreeColumn")
          .replace("http://www.guardianholidayoffers.co.uk/Image.aspx",
          "http://resource.guim.co.uk/travel/holiday-offers-micro/image"),
        (node \ "@fromprice").text.replace(".00", ""),
        dateFormat.parseDateTime((node \ "@earliestdeparture").text),
        Nil,
        (node \\ "country").map(_.text).toList
      )
    }

    getOffersRequestBody map {
      body =>
        ((XML.loadString(body) \\ "offer").zipWithIndex map {
          case (xml, idx) => buildOffer(idx, xml)
        }).toList
    }
  }

}
