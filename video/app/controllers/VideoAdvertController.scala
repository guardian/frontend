package controllers

import conf._
import common._
import play.api.mvc.{ Content => _, _ }
import concurrent.{ExecutionContext, Future}
import play.api.libs.ws.WS
import ExecutionContext.Implicits.global
import play.api.libs.json.Json
import play.api.libs.json.Json._


object VideoAdvertController extends Controller with Logging {

  def fetch(format: String, path: String) = Action { implicit request =>

    val url: String = "http://oas.guardian.co.uk/" + path

    Async {
      WS.url(url).get().map { response =>
        response.status match {
          case 200 =>
            val xml = response.xml
            val files = xml \\ "MediaFile"
            val media = files.head.child.head.toString().trim()
            val json = Json.stringify(toJson(Map("file" -> media)))
            Ok(json) as "application/json"
          case 404 => NotFound
        }
      }
    }
  }
}
