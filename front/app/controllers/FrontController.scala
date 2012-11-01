package controllers

import common._
import conf._
import front.Front
import model._
import play.api.mvc._
import play.api.libs.concurrent.Akka
import play.api.Play.current
import model.Trailblock
import scala.Some
import com.gu.openplatform.contentapi.model.ItemResponse

object FrontPage extends MetaData {
  override val canonicalUrl = "http://www.guardian.co.uk"
  override val id = ""
  override val section = ""
  override val webTitle = "The Guardian"
  override lazy val analyticsName = "GFE:Network Front"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "content-type" -> "Network Front"
  )
}

class FrontController extends Controller with Logging {

  val front: Front = Front

  def warmup() = Action {
    val promiseOfWarmup = Akka.future(Front.warmup())
    Async { promiseOfWarmup.map(warm => Ok("warm")) }
  }

  def isUp() = Action { Ok("Ok") }

  def render(path: String) = Action { implicit request =>
    val edition = Edition(request, Configuration)

    val page: Option[MetaData] = path match {
      case "front" => Some(FrontPage)
      case _ => ContentApi.item(path, edition)
        .showEditorsPicks(true)
        .showMostViewed(true)
        .response.section map { Section(_) }
    }

    page map { page =>
      // get the trailblocks
      val trailblocks: Seq[Trailblock] = Front(path, edition)
      Cached(page) { Ok(Compressed(views.html.front(page, trailblocks))) }
    } getOrElse (InternalServerError)
  }

}

object FrontController extends FrontController
