package controllers

import common.{Logging, AkkaSupport}
import scala.xml.{XML, Elem}
import play.api.libs.json.Json._
import play.api.libs.json.JsObject
import scala.concurrent.duration._
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._
import scala.concurrent.{Future, Await}


trait VideoAdvertAgent extends AkkaSupport with Logging {

  lazy val agent = play_akka.agent[Option[JsObject]](None)

  private lazy val schedule = play_akka.scheduler.every(1.minute, initialDelay = 10.seconds){
    val random = System.currentTimeMillis
    loadAd(s"http://oas.guardian.co.uk//2/m.guardiantest.co.uk/$random@x40").foreach(agent.send(_))
  }

  def loadAd(url: String): Future[Option[JsObject]] = {
    WS.url(url).withTimeout(5000).get().map {
      response =>
        response.status match {
          case 200 => parse(response.body)
          case error =>
            log.error(s"Error loading video ads $error ${response.statusText}")
            None
        }
    }
  }

  def parseThirdParty(xml: Elem) = loadAd((xml \\ "VASTAdTagURL" \ "URL").text.trim)

  def parse(body: String): Option[JsObject] = {
    val xml = XML.loadString(body)

    xml.label match {
      case "VAST" => Some(parseVast(xml))
      case "VideoAdServingTemplate" => Await.result(parseThirdParty(xml), 5.seconds)
      case other =>
        log.info(s"Did not understand video ad document $other")
        None
    }
  }


  //just touch schedule
  def start() = schedule

  def stop() {
    schedule.cancel()
    agent.close()
  }



  private def parseVast(xml: Elem) = {
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

    toJson(Map(
      "file" -> toJson(media),
      "trackingEvents" -> toJson(tracking)
    )).as[JsObject]
  }


}

object VideoAdvertAgent extends VideoAdvertAgent {
  def apply() = agent()
}
