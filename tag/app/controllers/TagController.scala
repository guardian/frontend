package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._
import play.api.Play.current
import play.api.libs.concurrent.Akka

case class TagAndTrails(tag: Tag, trails: Seq[Trail], leadContent: Seq[Trail])

object TagController extends Controller with Logging {
  def render(path: String) = Action { implicit request =>
    val promiseOfTag = Akka.future(lookup(path))
    Async {
      promiseOfTag.map(_.map { renderTag } getOrElse { NotFound })
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Option[TagAndTrails] = suppressApi404 {
    val edition = Edition(request, Configuration)
    log.info("Fetching tag: " + path + " for edition " + edition)

    val response: ItemResponse = ContentApi.item(path, edition).tag(None).pageSize(30).response

    val tag = response.tag map { new Tag(_) }

    val trails = SupportedContentFilter(response.results map { new Content(_) }) take (20)

    val leadContentCutOff = DateTime.now - 7.days

    val leadContent = SupportedContentFilter(
      response.leadContent.take(1).map { new Content(_) }.filter(_.webPublicationDate > leadContentCutOff)
    )

    val leadContentIds = leadContent map (_.id)

    tag map { TagAndTrails(_, trails.filter(c => !leadContentIds.exists(_ == c.id)), leadContent) }
  }

  private def renderTag(model: TagAndTrails)(implicit request: RequestHeader) = Cached(model.tag) {
    Ok(Compressed(views.html.tag(model.tag, model.trails, model.leadContent)))
  }
}