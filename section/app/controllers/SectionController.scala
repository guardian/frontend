package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.Play.current
import play.api.libs.concurrent.Akka

case class SectionFrontPage(section: Section, editorsPicks: Seq[Trail], latestContent: Seq[Trail])

object SectionController extends Controller with Logging with Paging with Formats {

  val validFormats: Seq[String] = Seq("html", "json")

  def render(path: String, format: String) = Action { implicit request =>
    val promiseOfSection = Akka.future(lookup(path))
    checkFormat(format) match {
      case Some(format) => Async(promiseOfSection.map(_.map { renderSectionFront(_, format) } getOrElse { NotFound }))
      case None => BadRequest
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Option[SectionFrontPage] = suppressApi404 {
    val edition = Edition(request, Configuration)
    log.info("Fetching front: " + path + "for edition " + edition)
    val response: ItemResponse = ContentApi.item(path, edition)
      .showEditorsPicks(true)
      .showMostViewed(true)
      .response

    val section = response.section map { Section(_) }

    val editorsPicks = response.editorsPicks map { new Content(_) }

    val editorsPicksIds = editorsPicks map { _.id }

    val latestContent = response.results map { new Content(_) } filterNot { c => editorsPicksIds contains (c.id) }

    section map { SectionFrontPage(_, editorsPicks, latestContent) }
  }

  private def renderSectionFront(model: SectionFrontPage, format: String)(implicit request: RequestHeader) = Cached(model.section) {

    if (format == "json") {
      // pull out the paging params
      val pagingParams = extractPaging(request)
      val actualOffset = pagingParams("offset") + (pagingParams("page-size") * (pagingParams("page") - 1))
      // offest the trails
      val trails: Seq[Trail] = (model.editorsPicks ++ model.latestContent).drop(actualOffset)
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

    } else {
      Ok(Compressed(views.html.section(model.section, model.editorsPicks, model.latestContent)))
    }

  }

}
