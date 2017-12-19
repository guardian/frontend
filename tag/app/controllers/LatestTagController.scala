package controllers

import common._
import contentapi.{ContentApiClient, Paths}
import layout.FrontPageItem
import model.Cached.WithoutRevalidationResult
import model._
import org.joda.time.DateTime
import play.api.mvc._
import services.TagPage

import scala.concurrent.Future

class LatestTagController(
  contentApiClient: ContentApiClient,
  val controllerComponents: ControllerComponents)
  extends BaseController with ImplicitControllerExecutionContext with implicits.ItemResponses with Logging {

  def latest(path: String): Action[AnyContent] = Action.async { implicit request =>
    loadLatest(path).map { _.map { tagPage =>
      tagPage.page match {
        case tag: Tag if tag.isSeries || tag.isBlog => tagPage.trails.headOption.map(latest => {
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
  private def loadLatest(path: String)(implicit request: RequestHeader): Future[Option[TagPage]] = {
    val result = contentApiClient.getResponse(
      contentApiClient.item(s"/$path", Edition(request))
        .pageSize(1)
        .orderBy("newest")
    ).map{ item =>
      item.section.map( section =>
        TagPage(
          page = Section.make(section),
          contents = item.results.getOrElse(Nil).map(FrontPageItem(_)),
          tags = Tags(Nil),
          date = DateTime.now,
          tzOverride = None
        )
      ).orElse(item.tag.map( tag =>
        TagPage(
          page = Tag.make(tag),
          contents = item.results.getOrElse(Nil).map(FrontPageItem(_)),
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
