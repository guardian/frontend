package controllers

import common._
import conf._
import model._
import play.api.mvc._
import scala.concurrent.Future
import com.gu.openplatform.contentapi.model.ItemResponse
import model.Content

case class InteractivePage(
  interactive: Interactive,
  storyPackage: List[Trail],
  index: Int,
  trail: Boolean)

object InteractiveController extends Controller with Logging with ExecutionContexts {

  def renderInteractiveJson(path: String): Action[AnyContent] = renderInteractive(path)
  def renderInteractive(path: String): Action[AnyContent] = Action.async { implicit request =>
    val index = request.getQueryString("index") map (_.toInt) getOrElse 1
    val isTrail = request.getQueryString("trail") map (_.toBoolean) getOrElse false

    lookup(path, index, isTrail) map {
      case Left(model) if model.interactive.isExpired => Gone(views.html.expired(model.interactive))
      case Left(model) => render(model)
      case Right(notFound) => notFound
    }
  }

  private def lookup(path: String, index: Int, isTrail: Boolean)(implicit request: RequestHeader): Future[Either[InteractivePage, SimpleResult]] = {
    val edition = Edition(request)
    log.info(s"Fetching interactive: $path for edition $edition")
    val response: Future[ItemResponse] = ContentApi.item(path, edition)
      .showExpired(true)
      .showFields("all")
      .response

    val result = response map { response =>
      val interactive = response.content map { new Interactive(_) }
      val storyPackage = response.storyPackage map { Content(_) }

      val model = interactive map { i => InteractivePage(i, storyPackage.filterNot(_.id == i.id), index, isTrail) }
      ModelOrResult(model, response)
    }

    result recover suppressApiNotFound
  }


  private def render(model: InteractivePage)(implicit request: RequestHeader) = {
    val htmlResponse = () => views.html.interactive(model.interactive, model.storyPackage, model.index, model.trail)
    val jsonResponse = () => views.html.fragments.interactiveBody(model.interactive, model.storyPackage, model.index, model.trail)
    renderFormat(htmlResponse, jsonResponse, model.interactive, Switches.all)
  }
}
