package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common._
import model.Cached.WithoutRevalidationResult
import model._
import play.api.mvc._
import services.{Index, IndexPage}
import views.support.RenderOtherStatus
import views.support.RenderOtherStatus.gonePage

import scala.concurrent.Future
import scala.concurrent.Future.successful

trait IndexControllerCommon
    extends BaseController
    with Index
    with RendersItemResponse
    with GuLogging
    with Paging
    with ImplicitControllerExecutionContext {
  private val TagPattern = """^([\w\d-]+)/([\w\d-]+)$""".r

  implicit val context: ApplicationContext

  // Needed as aliases for reverse routing
  def renderCombinerRss(leftSide: String, rightSide: String): Action[AnyContent] = renderCombiner(leftSide, rightSide)

  def renderCombiner(leftSide: String, rightSide: String): Action[AnyContent] =
    Action.async { implicit request =>
      logGoogleBot(request)
      index(Edition(request), leftSide, rightSide, inferPage(request), request.isRss).map {
        case Left(page)   => renderFaciaFront(page)
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

  def render(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      renderItem(path)
    }

  private def redirect(id: String, isRss: Boolean) =
    WithoutRevalidationResult(MovedPermanently(if (isRss) s"/$id/rss" else s"/$id"))

  def renderTrailsJson(path: String): Action[AnyContent] = renderTrails(path)

  def renderTrails(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      index(Edition(request), path, inferPage(request), request.isRss) map {
        case Left(model)     => renderTrailsFragment(model)
        case Right(notFound) => notFound
      }
    }

  protected def renderFaciaFront(model: IndexPage)(implicit request: RequestHeader): Result

  private def renderTrailsFragment(model: IndexPage)(implicit request: RequestHeader) = {
    val response = () =>
      views.html.fragments.trailblocks.headline(model.faciaTrails, numItemsVisible = model.trails.size)
    renderFormat(response, response, model.page)
  }

  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] =
    path match {
      //if this is a section tag e.g. football/football
      case TagPattern(left, right) if left == right => successful(Cached(60)(redirect(left, request.isRss)))
      case _ => {
        logGoogleBot(request)
        index(Edition(request), path, inferPage(request), request.isRss) map {
          case Left(model) if model.contents.nonEmpty => renderFaciaFront(model)
          // if no content is returned (as often happens with old/expired/migrated microsites) return 404 rather than an empty page
          case Left(model) if model.contents.isEmpty =>
            Cached(60)(
              WithoutRevalidationResult(
                Gone(
                  views.html.gone(
                    gonePage,
                    "Sorry - there is no content here",
                    "This could be, for example, because content associated with it is not yet published, or due to legal reasons such as the expiry of our rights to publish the content.",
                  ),
                ),
              ),
            )
          case Right(other) => RenderOtherStatus(other)
        }
      }

    }

  override def canRender(item: ItemResponse): Boolean = item.section.orElse(item.tag).isDefined
}
