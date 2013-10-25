package model.commercial.travel

import scala.concurrent.Future
import play.api.libs.ws.WS
import common.{Logging, ExecutionContexts}
import org.joda.time.format.DateTimeFormat
import scala.xml.{Elem, Node}
import conf.CommercialConfiguration

object OffersApi extends ExecutionContexts with Logging {

  private val dateFormat = DateTimeFormat.forPattern("dd-MMM-yyyy")

  private def loadXml: Future[Elem] = {
    CommercialConfiguration.travelOffersApi.url map {
      WS.url(_) withHeaders (("Cache-Control", "public, max-age=1")) withRequestTimeout 20000 get() map {
        response => response.xml
      }
    } getOrElse {
      log.error("No Travel Offers API config properties set")
      Future(<offers/>)
    }
  }

  def getAllOffers(xml: => Future[Elem] = loadXml): Future[List[Offer]] = {

    def buildOffer(id: Int, node: Node): Offer = {
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

    xml map {
      offers =>
        ((offers \\ "offer").zipWithIndex map {
          case (offerXml, idx) => buildOffer(idx, offerXml)
        }).toList
    }
  }

}
