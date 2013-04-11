package controllers

import common._
import front._
import model._
import play.api.mvc._
import model.Trailblock
import scala.Some
import play.api.libs.concurrent.Execution.Implicits._
import concurrent.Future

object NetworkFrontPage extends MetaData {
  override val canonicalUrl = Some("http://www.guardian.co.uk")
  override val id = ""
  override val section = ""
  override val webTitle = "The Guardian"
  override lazy val analyticsName = "GFE:Network Front"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "content-type" -> "Network Front"
  )
}

object SportFrontPage extends MetaData {
  override val canonicalUrl = Some("http://www.guardian.co.uk/sport")
  override val id = "sport"
  override val section = "sport"
  override val webTitle = "Sport"
  override lazy val analyticsName = "GFE:sport"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> "Sport",
    "content-type" -> "Section"
  )
}

object CultureFrontPage extends MetaData {
  override val canonicalUrl = Some("http://www.guardian.co.uk/culture")
  override val id = "culture"
  override val section = "culture"
  override val webTitle = "Culture"
  override lazy val analyticsName = "GFE:culture"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> "Culture",
    "content-type" -> "Section"
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
  
  def render(path: String) = Action {
    implicit request => 
      renderFront(path)
  }

  def renderFront(path: String)(implicit request: RequestHeader) = {

    val edition = Site(request).edition

    val frontPage: MetaData = path match {
      case "front" => NetworkFrontPage
      case "sport" => SportFrontPage
      case "culture" => CultureFrontPage
    }

    // get the trailblocks
    val trailblocks: Seq[Trailblock] = front(path, edition)
    if (trailblocks.isEmpty) {
      InternalServerError
    } else {
      Cached(frontPage) {
        request.getQueryString("callback").map { callback =>
          JsonComponent(views.html.fragments.frontBody(frontPage, trailblocks))
        } getOrElse {
          Ok(Compressed(views.html.front(frontPage, trailblocks)))
        }
      }
    }
  }

}

object FrontController extends FrontController
