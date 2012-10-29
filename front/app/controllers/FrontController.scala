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

case class FrontPage(trailblocks: Seq[Trailblock]) extends MetaData {
  override val canonicalUrl = "http://www.guardian.co.uk"
  override val id = ""
  override val section = ""
  override val apiUrl = "http://content.guardianapis.com"
  override val webTitle = "The Guardian"
  override lazy val analyticsName = "GFE:Network Front"

  override lazy val metaData: Map[String, Any] = super.metaData ++ Map(
    "keywords" -> "",
    "content-type" -> "Network Front"
  )

  lazy val collapseEmptyBlocks: FrontPage = new FrontPage(trailblocks filterNot { _.trails.isEmpty })
}

class FrontController extends Controller with Logging {

  val front: Front = Front

  def warmup() = Action {
    val promiseOfWarmup = Akka.future(Front.warmup())
    Async { promiseOfWarmup.map(warm => Ok("warm")) }
  }

  def isUp() = Action { Ok("Ok") }

  def render() = renderFor("front")

  //todo 404 on not found
  def renderFor(path: String) = Action { implicit request =>
    //in this case lookup has no blocking IO - so not Async here
    lookup(path) map { renderFront } getOrElse { NotFound }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Option[FrontPage] = {
    val edition = Edition(request, Configuration)
    Some(front(path, edition))
  }

  private def renderFront(model: FrontPage)(implicit request: RequestHeader) = model match {
    case FrontPage(Nil) => InternalServerError
    case m => Cached(m) { Ok(Compressed(views.html.front(model))) }
  }
}

object FrontController extends FrontController
