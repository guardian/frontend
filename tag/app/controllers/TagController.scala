package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common._
import contentapi.{ContentApiClient, SectionsLookUp}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import pages.TagHtmlPage
import play.api.mvc._
import services.{TagPageService, TagPage}
import views.support.RenderOtherStatus

import scala.concurrent.Future
import scala.concurrent.Future.successful

class TagController(
  val contentApiClient: ContentApiClient,
  val sectionsLookUp: SectionsLookUp,
  val controllerComponents: ControllerComponents
)(implicit val context: ApplicationContext)
 extends BaseController with TagPageService with RendersItemResponse with Logging with Paging with ImplicitControllerExecutionContext {
  private val TagPattern = """^([\w\d-]+)/([\w\d-]+)$""".r

  // Needed as aliases for reverse routing
  def renderCombinerRss(leftSide: String, rightSide: String): Action[AnyContent] = renderCombiner(leftSide, rightSide)

  def renderCombiner(leftSide: String, rightSide: String): Action[AnyContent] = Action.async { implicit request =>
    logGoogleBot(request)
    tagPage(Edition(request), leftSide, rightSide, inferPage(request), request.isRss).map {
      case Left(page) => renderFaciaFront(page)
      case Right(other) => other
    }
  }

  private def logGoogleBot(request: RequestHeader) = {
    request.headers.get("User-Agent").filter(_.contains("Googlebot")).foreach { _ =>
      log.info(s"GoogleBot => ${request.uri}")
    }
  }

  def renderJson(path: String): Action[AnyContent] = render(path)

  def renderRss(path: String): Action[AnyContent] = render(path)

  def render(path: String): Action[AnyContent] = Action.async { implicit request =>
    renderItem(path)
  }

  private def redirect(id: String, isRss: Boolean) = WithoutRevalidationResult(MovedPermanently(if (isRss) s"/$id/rss" else s"/$id"))

  def renderTrailsJson(path: String): Action[AnyContent] = renderTrails(path)

  def renderTrails(path: String): Action[AnyContent] = Action.async { implicit request =>
    tagPage(Edition(request), path, inferPage(request), request.isRss) map {
      case Left(model) => renderTrailsFragment(model)
      case Right(notFound) => notFound
    }
  }

  private def renderFaciaFront(model: TagPage)(implicit request: RequestHeader): Result = {
    Cached(model.page) {
      if (request.isRss) {
        val body = TrailsToRss(model.page.metadata, model.trails.map(_.trail))
        RevalidatableResult(Ok(body).as("text/xml; charset=utf-8"), body)
      } else if (request.isJson) {
        JsonComponent(views.html.fragments.tagPageBody(model))
      } else {
        RevalidatableResult.Ok(TagHtmlPage.html(model))
      }
    }
  }

  private def renderTrailsFragment(model: TagPage)(implicit request: RequestHeader) = {
    val response = () => views.html.fragments.trailblocks.headline(model.faciaTrails, numItemsVisible = model.trails.size)
    renderFormat(response, response, model.page)
  }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = path match {
    //if this is a section tag e.g. football/football
    case TagPattern(left, right) if left == right => successful(Cached(60)(redirect(left, request.isRss)))

    case _ =>
      logGoogleBot(request)
      tagPage(Edition(request), path, inferPage(request), request.isRss) map {
        case Left(model) => renderFaciaFront(model)
        case Right(other) => RenderOtherStatus(other)
      }
  }

  override def canRender(item: ItemResponse): Boolean = item.section.orElse(item.tag).isDefined
}
