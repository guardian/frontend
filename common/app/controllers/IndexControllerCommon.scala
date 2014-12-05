package controllers

import common._
import model._
import play.api.mvc._
import services.Index
import services.IndexPage
import performance.MemcachedAction
import scala.concurrent.Future.successful

trait IndexControllerCommon extends Controller with Index with Logging with Paging with ExecutionContexts {
  private val TagPattern = """^([\w\d-]+)/([\w\d-]+)$""".r

  // Needed as aliases for reverse routing
  def renderCombinerRss(leftSide: String, rightSide: String) = renderCombiner(leftSide, rightSide)

  def renderCombiner(leftSide: String, rightSide: String) = MemcachedAction { implicit request =>
    logGoogleBot(request)
    index(Edition(request), leftSide, rightSide, inferPage(request), request.isRss).map {
      case Left(page) => renderFaciaFront(page)
      case Right(other) => other
    }
  }

  private def logGoogleBot(request: RequestHeader) = {
    request.headers.get("User-Agent").filter(_.contains("Googlebot")).foreach { bot =>
      log.info(s"GoogleBot => ${request.uri}")
    }
  }

  def renderJson(path: String) = render(path)

  def renderRss(path: String) = render(path)

  def render(path: String) = MemcachedAction { implicit request =>
    path match {
      //if this is a section tag e.g. football/football
      case TagPattern(left, right) if left == right => successful(redirect(left, request.isRss))

      case _ =>
        logGoogleBot(request)
        index(Edition(request), path, inferPage(request), request.isRss) map {
          case Left(model) =>
            renderFaciaFront(model)
          case Right(other) =>
            other
        }
    }
  }

  private def redirect(id: String, isRss: Boolean) = Cached(60)(MovedPermanently(if (isRss) s"/$id/rss" else s"/$id"))

  def renderTrailsJson(path: String) = renderTrails(path)

  def renderTrails(path: String) = MemcachedAction { implicit request =>
    index(Edition(request), path, inferPage(request), request.isRss) map {
      case Left(model) => renderTrailsFragment(model)
      case Right(notFound) => notFound
    }
  }

  protected def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader): Result

  private def renderTrailsFragment(model: IndexPage)(implicit request: RequestHeader) = {
    val response = () => views.html.fragments.trailblocks.headline(model.trails, numItemsVisible = model.trails.size)
    renderFormat(response, response, model.page)
  }
}
