package controllers

import common._
import conf._
import front._
import model._
import play.api.mvc._
import model.Trailblock
import scala.Some
import play.api.libs.concurrent.Execution.Implicits._
import concurrent.Future

object FrontPage extends MetaData {
  override val canonicalUrl = Some("http://www.guardian.co.uk")
  override val id = ""
  override val section = ""
  override val webTitle = "The Guardian"
  override lazy val analyticsName = "GFE:Network Front"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "content-type" -> "Network Front"
  )
}

class FrontController extends Controller with Logging with JsonTrails {

  val front: Front = Front

  def warmup() = Action {
    val promiseOfWarmup = Future(Front.warmup)
    Async {
      promiseOfWarmup.map(warm => Ok("warm"))
    }
  }

  def isUp() = Action {
    Ok("Ok")
  }

  def render(path: String) = Action { implicit request =>
    renderFront(path, "html")
  }

  def renderJson(path: String) = Action { implicit request =>
    renderFront(path, "json")
  }

  private def renderFront(path: String, format: String)(implicit request: RequestHeader) = {

    val edition = Site(request).edition

    val page: Option[MetaData] = path match {
      case "front" => Some(FrontPage)
      case section => ContentApi.item(section, edition)
        .showEditorsPicks(true)
        .showMostViewed(true)
        .response.section map {
          Section(_)
        }
    }

    page.map { frontPage =>
      // get the trailblocks
      val trailblocks: Seq[Trailblock] = front(path, edition)
      if (trailblocks.isEmpty) {
        InternalServerError
      } else {
        Cached(frontPage) {
          if (format == "json") {
            // pull out correct trailblock
            trailblocks.find(_.description.id == path).map {
              trailblock =>
                renderJsonTrails(trailblock.trails)
            }.getOrElse(InternalServerError)
          } else {
            Ok(Compressed(views.html.front(frontPage, trailblocks)))
          }
        }
      }
    }.getOrElse(NotFound)
  }
}

object FrontController extends FrontController
