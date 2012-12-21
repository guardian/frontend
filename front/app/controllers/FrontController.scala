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

class FrontController extends Controller with Logging with Paging with Formats {

  val front: Front = Front

  val validFormats: Seq[String] = Seq("html", "json")

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

  def render(path: String, format: String) = Action { implicit request =>
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
      if (trailblocks.isEmpty) {
        InternalServerError
      } else {
        checkFormat(format).map { format =>
          Cached(page) {
            if (format == "json") {
              // pull out the paging params
              val pagingParams = extractPaging(request)
              // offest the trails
              val actualOffset = pagingParams("offset") + (pagingParams("page-size") * (pagingParams("page") - 1))
              // pull out correct trailblock
              trailblocks.find(_.description.id == path).map { trailblock =>
                val trails: Seq[Trail] = trailblock.trails.drop(actualOffset)
                if (trails.size == 0) {
                  NoContent
                } else {
                  JsonComponent(
                    request.getQueryString("callback"),
                    "html" -> views.html.fragments.trailblocks.section(
                      trails.take(pagingParams("page-size")), numWithImages = 0, showFeatured = false
                    ),
                    "hasMore" -> (trails.size > pagingParams("page-size"))
                  )
                }
              } getOrElse (NoContent)
            } else {
              Ok(Compressed(views.html.front(page, trailblocks, FrontCharity())))
            }
          }
        } getOrElse (BadRequest)
      }
    } getOrElse (InternalServerError)
  }

}

object FrontController extends FrontController
