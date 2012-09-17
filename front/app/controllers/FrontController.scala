package controllers

import common._
import conf._
import front.Front
import model._
import play.api.mvc.{ Result, RequestHeader, Controller, Action }
import play.api.libs.concurrent.Akka
import play.api.Play
import Play.current

case class FrontPage(trailblocks: Seq[Trailblock]) extends MetaData {
  override val canonicalUrl = "http://www.guardian.co.uk"
  override val id = ""
  override val section = ""
  override val apiUrl = "http://content.guardianapis.com"
  override val webTitle = "The Guardian"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> "",
    "content-type" -> "Network Front"
  )

  lazy val collapseEmptyBlocks: FrontPage = new FrontPage(trailblocks filterNot { _.trails.isEmpty })
}

object FrontController extends Controller with Logging {

  def warmup() = Action {
    log.info("warming up front")
    val promiseOfWarmup = Akka.future {
      Front.startup()
    }

    Async {
      promiseOfWarmup.map(warm => Ok("warm"))
    }
  }

  def render() = Action { implicit request =>
    //in this case lookup has no blocking IO - so not Async here
    lookup() map { renderFront } getOrElse { NotFound }
  }

  private def lookup()(implicit request: RequestHeader): Option[FrontPage] = {
    val edition = Edition(request, Configuration)
    Some(Front(edition))
  }

  private def renderFront(model: FrontPage)(implicit request: RequestHeader): Result =
    CachedOk(model) {
      Compressed(views.html.front(model))
    }
}
