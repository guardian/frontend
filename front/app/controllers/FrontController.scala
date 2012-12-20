package controllers

import common._
import conf._
import front._
import model._
import play.api.mvc._
import play.api.libs.concurrent.Akka
import play.api.Play.current
import model.Trailblock
import scala.Some
import com.gu.openplatform.contentapi.model.ItemResponse

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

class FrontController extends Controller with Logging {

  val front: Front = Front

  def warmup() = Action {
    val promiseOfWarmup = Akka.future(Front.warmup())
    Async { promiseOfWarmup.map(warm => Ok("warm")) }
  }

  def isUp() = Action { Ok("Ok") }

  // pull out 'paging' (int) query string params
  private def extractPaging(request: RequestHeader, queryParam: String): Option[Int] = {
    try {
      request.getQueryString(queryParam).map(_.toInt)
    } catch {
      case _: NumberFormatException => None
    }
  }

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
      val trailblocks: Seq[Trailblock] = front(path, edition)
      if (trailblocks.isEmpty) InternalServerError
      else Cached(page) {
        request.getQueryString("callback").map { callback =>
          // pull out page-size, page and offset
          val offset: Int = extractPaging(request, "offset").getOrElse(0)
          val pageSize: Int = extractPaging(request, "page-size").getOrElse(5)
          val page: Int = extractPaging(request, "page").getOrElse(1)
          // assumtion - first trailblock is for this section
          val trails: Seq[Trail] = (trailblocks.head.trails).drop(offset + (pageSize * (page - 1)))
          if (trails.size == 0) {
            NoContent
          } else {
            JsonComponent(
              "html" -> views.html.fragments.trailblocks.section(trails.take(pageSize), numWithImages = 0, showFeatured = false),
              "hasMore" -> (trails.size > pageSize)
            )
          }
        }.getOrElse {
          Ok(Compressed(views.html.front(page, trailblocks, FrontCharity())))
        }

      }
    } getOrElse (InternalServerError)
  }

}

object FrontController extends FrontController
