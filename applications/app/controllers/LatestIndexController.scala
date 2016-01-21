package controllers

import common._
import conf.LiveContentApi
import conf.LiveContentApi.getResponse
import contentapi.Paths
import model._
import org.joda.time.DateTime
import play.api.mvc.{Action, Controller, RequestHeader}
import services.{IndexPage, IndexPageItem}

import scala.concurrent.Future

object LatestIndexController extends Controller with ExecutionContexts with implicits.ItemResponses with Logging {
  def latest(path: String) = Action.async { implicit request =>
    loadLatest(path).map { _.map { index =>
      index.page match {
        case tag: Tag if tag.isSeries || tag.isBlog => index.trails.headOption.map(latest => Found(latest.metadata.url)).getOrElse(NotFound)
        case tag: Tag => MovedPermanently(s"${tag.metadata.url}/all")
        case section: Section =>
          val url = if (section.isEditionalised) Paths.stripEditionIfPresent(section.metadata.url) else section.metadata.url
          MovedPermanently(s"$url/all")
        case _ => NotFound
      }
    }.getOrElse(NotFound)}.map(Cached(300)(_))
  }

  // this is simply the latest by date. No lead content, editors picks, or anything else
  private def loadLatest(path: String)(implicit request: RequestHeader): Future[Option[IndexPage]] = {
    val result = getResponse(
      LiveContentApi.item(s"/$path", Edition(request))
        .pageSize(1)
        .orderBy("newest")
    ).map{ item =>
      item.section.map( section =>
        IndexPage(
          page = Section.make(section),
          contents = item.results.map(IndexPageItem(_)),
          tags = Tags(Nil),
          date = DateTime.now,
          tzOverride = None
        )
      ).orElse(item.tag.map( tag =>
        IndexPage(
          page = Tag.make(tag),
          contents = item.results.map(IndexPageItem(_)),
          tags = Tags(Nil),
          date = DateTime.now,
          tzOverride = None
        )
      ))
    }

    result recover { case e: Exception =>
      log.error(e.getMessage, e)
      None
    }
  }
}
