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


object VideoAdvertController extends Controller with Logging {

  def fetch(format: String, path: String) = Action { implicit request =>

    val url: String = "http://oas.guardian.co.uk/" + path

//    if(CommonSwitches.VideoAdvertsSwitch.isSwitchedOn) {

      Async {
          //Timeout is set to be very low so we don't bring down video boxes due to long OAS response times
          WS.url(url).withTimeout(300).get().map { response =>
            response.status match {
              case 200 =>
                val xml = response.xml
                val files = xml \\ "MediaFile"
                val media = files.head.child.head.toString().trim()
                val json = toJson(Map("file" -> media)).as[JsObject]

                Cached(15)(JsonComponent(json))

              case 404 => NotFound
            }
          }
      }

//    } else {
//       ServiceUnavailable
//    }
  }
}
