package controllers

import contentapi.Paths
import play.api.mvc.{RequestHeader, Action, Controller}
import scala.concurrent.Future
import conf.LiveContentApi
import model.{Cached, Tag, Content, Section}
import services.{IndexPageItem, IndexPage}
import common._
import LiveContentApi.getResponse

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
        IndexPage(Section.make(section), item.results.map(IndexPageItem(_)))
      ).orElse(item.tag.map( tag =>
        IndexPage(Tag.make(tag), item.results.map(IndexPageItem(_)))
      ))
    }

    result recover { case e: Exception =>
      log.error(e.getMessage, e)
      None
    }
  }
}
