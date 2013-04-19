package controllers

import conf._
import common._
import play.api.mvc.{ Content => _, _ }
import concurrent.{ExecutionContext, Future}
import play.api.libs.ws.WS
import ExecutionContext.Implicits.global
import play.api.libs.json.{JsObject, Json}
import play.api.libs.json.Json._
import model.Cached
import scala.xml.Elem

object VideoAdvertController extends Controller with Logging {

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

  def fetch(format: String) = Action { implicit request =>

    val url: String = "http://oas.guardian.co.uk//2/m.guardiantest.co.uk/self-hosted/1234567890@x40"

    if(CommonSwitches.VideoAdvertSwitch.isSwitchedOn) {

      Async {
          //Timeout is set to be very low so we don't bring down video boxes due to long OAS response times
          WS.url(url).withTimeout(300).get().map { response =>
            response.status match {
              case 200 =>
                val xml = response.xml

                //We currently only support the VAST xml schema
                xml.label match {
                  case "VAST" => Cached(15)(JsonComponent(parseVast(xml)))
                  case _ => NotFound
                }

              case 404 => NotFound
            }
          }
      }

    } else {
       ServiceUnavailable
    }
  }
}
