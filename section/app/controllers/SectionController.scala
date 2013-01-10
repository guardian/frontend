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

  def render(path: String, format: String = "html") = Action { implicit request =>
    val promiseOfSection = Akka.future(lookup(path))
    // make sure a valid format has been requested
    checkFormat(format).map { validFormat =>
      Async(promiseOfSection.map(_.map { renderSectionFront(_, validFormat) } getOrElse { NotFound }))
    } getOrElse (BadRequest)
  }

  private def lookup(path: String)(implicit request: RequestHeader): Option[SectionFrontPage] = suppressApi404 {
    val edition = Edition(request, Configuration)
    log.info("Fetching front: " + path + "for edition " + edition)
    val response: ItemResponse = ContentApi.item(path, edition)
      .tag(None)
      .showEditorsPicks(true)
      .response

    val section = response.section map { Section(_) }

    val editorsPicks = SupportedContentFilter(response.editorsPicks map { new Content(_) })

    val editorsPicksIds = editorsPicks map { _.id }

    val latestContent = SupportedContentFilter(
      response.results map { new Content(_) } filterNot { c => editorsPicksIds contains (c.id) }
    )

    section map { SectionFrontPage(_, editorsPicks, latestContent) }
  }

  private def renderSectionFront(model: SectionFrontPage, format: String)(implicit request: RequestHeader) = Cached(model.section) {
    checkFormat(format).map { format =>
      if (format == "json") {
        renderJsonTrails(model.editorsPicks ++ model.latestContent)
      } else {
        Ok(Compressed(views.html.section(model.section, model.editorsPicks, model.latestContent)))
      }
    } getOrElse (BadRequest)
  }

}
