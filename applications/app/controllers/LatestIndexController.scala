package controllers

import common._
import contentapi.ContentApiClient
import contentapi.ContentApiClient.getResponse
import contentapi.Paths
import model.Cached.WithoutRevalidationResult
import model._
import org.joda.time.DateTime
import play.api.mvc.{Action, Controller, RequestHeader}
import services.{IndexPage, IndexPageItem}

import scala.concurrent.Future

class LatestIndexController extends Controller with ExecutionContexts with implicits.ItemResponses with Logging {
  def latest(path: String) = Action.async { implicit request =>
    loadLatest(path).map { _.map { index =>
      index.page match {
        case tag: Tag if tag.isSeries || tag.isBlog => index.trails.headOption.map(latest => {
          if (request.isEmail) {
            Redirect(latest.metadata.url + "/email", request.campaignCode.fold(Map[String, Seq[String]]())(c => Map("CMP" -> Seq(c))))
          }
          else Found(latest.metadata.url)
        }).getOrElse(NotFound)

        case tag: Tag => MovedPermanently(s"${tag.metadata.url}/all")
        case section: Section =>
          val url = if (section.isEditionalised) Paths.stripEditionIfPresent(section.metadata.url) else section.metadata.url
          MovedPermanently(s"$url/all")
        case _ => NotFound
      }
    }.getOrElse(NotFound)}.map(r => Cached(300)(WithoutRevalidationResult(r)))
  }

  // this is simply the latest by date. No lead content, editors picks, or anything else
  private def loadLatest(path: String)(implicit request: RequestHeader): Future[Option[IndexPage]] = {
    val result = getResponse(
      ContentApiClient.item(s"/$path", Edition(request))
        .pageSize(1)
        .orderBy("newest")
    ).map{ item =>
      item.section.map( section =>
        IndexPage(
          page = Section.make(section),
          contents = item.results.getOrElse(Nil).map(IndexPageItem(_)),
          tags = Tags(Nil),
          date = DateTime.now,
          tzOverride = None
        )
      ).orElse(item.tag.map( tag =>
        IndexPage(
          page = Tag.make(tag),
          contents = item.results.getOrElse(Nil).map(IndexPageItem(_)),
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

object LatestIndexController extends LatestIndexController
