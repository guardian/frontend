package controllers

import common.{Logging, AkkaSupport}
import scala.xml.{XML, Elem}
import scala.concurrent.duration._
import play.api.libs.ws.WS
import scala.concurrent.{Future, Await}

case class VideoAdvert(media: String, tracking: Map[String, String])

object VideoAdvertAgent extends AkkaSupport with Logging {

  lazy val agent = play_akka.agent[Option[VideoAdvert]](None)

  private lazy val schedule = play_akka.scheduler.every(1.minute, initialDelay = 10.seconds) {

    val random = System.currentTimeMillis

    loadXml(s"http://oas.guardian.co.uk//2/m.guardian.co.uk/$random@x40").flatMap{ xml =>
      xml.label match {
        case "VAST" => Future(parseVast(xml))
        case "VideoAdServingTemplate" => {
          val oasImpression = (xml \\ "Impression" \ "URL").text.trim
          val oasClickThrough = (xml \\ "ClickTracking" \ "URL").text.trim
          parseThirdParty(xml).map{ ad =>
            ad.copy(tracking = ad.tracking + (("oasImpression" -> oasImpression), ("oasClickThrough" -> oasClickThrough)))
          }
        }
      }
    }.foreach(ad => agent.send(Some(ad)))
  }

  def parseThirdParty(xml: Elem) =  {
    val url = (xml \\ "VASTAdTagURL" \ "URL").text.trim
    loadXml(url).map(parseVast)
  }

  def loadXml(url: String): Future[Elem] = {

    WS.url(url).withTimeout(5000).get().map {
      response =>
        response.status match {
          case 200 => XML.loadString(response.body)
          case error =>
            log.error(s"Error loading video ads $error ${response.statusText}")
            <badXml></badXml>
        }
    }
  }

  //just touch schedule
  def start() = schedule

  def stop() {
    schedule.cancel()
    agent.close()
  }

  private def parseVast(xml: Elem): VideoAdvert = {
    val files = xml \\ "MediaFile"
    val media = files.headOption.map(_.text.trim()).getOrElse("")

    val impressionNode = xml \\ "Impression"
    val impression = impressionNode.headOption.map(_.text.trim()).getOrElse("")

    val clickThroughNode = xml \\ "ClickThrough"
    val clickThrough = clickThroughNode.headOption.map(_.text.trim()).getOrElse("")

    val trackingNodes = xml \\ "Tracking"
    val tracking = trackingNodes.map{ track =>
      val event = track.attribute("event").headOption.map(_.text.trim()).getOrElse("")
      val url = track.text.trim()
      (event -> url)
    }.toMap + (("impression" -> impression), ("clickThrough" -> clickThrough))

    VideoAdvert(media, tracking)
  }

  def apply() = agent()
}


