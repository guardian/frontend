package controllers

import common._
import contentapi.ContentApiClient
import contentapi.Paths
import model.Cached.WithoutRevalidationResult
import model._
import org.joda.time.DateTime
import play.api.mvc._
import services.{IndexPage, IndexPageItem}

import scala.concurrent.Future

class LatestIndexController(
  contentApiClient: ContentApiClient,
  val controllerComponents: ControllerComponents)
  extends BaseController with ImplicitControllerExecutionContext with implicits.ItemResponses with Logging {

  def latest(path: String): Action[AnyContent] = Action.async { implicit request =>
    loadLatest(path).map { _.map { index =>
      index.page match {
        case tag: Tag if tag.isSeries || tag.isBlog => handleSeriesBlogs(index)
        case tag: Tag => MovedPermanently(s"${tag.metadata.url}/all")
        case section: Section =>
          val url = if (section.isEditionalised) Paths.stripEditionIfPresent(section.metadata.url) else section.metadata.url
          MovedPermanently(s"$url/all")
        case _ => NotFound
      }
    }.getOrElse(NotFound)}.map(r => Cached(300)(WithoutRevalidationResult(r)))
  }

  private def handleSeriesBlogs(index: IndexPage)(implicit request: RequestHeader) = (index.trails.headOption, request.isEmail) match {
    case (Some(latest), true) =>
      val queryParameters = request.campaignCode.fold(Seq.empty[String])(c => Seq(s"CMP=$c"))
      val queryParameterWithFormat = if (request.isEmailHeadlineText) queryParameters :+ "format=email-headline" else queryParameters
      val queryString = if (queryParameterWithFormat.nonEmpty) s"?${queryParameterWithFormat.mkString("&")}" else ""

      val emailJsonSuffix = if (request.isEmailJson) ".emailjson" else ""
      val url = s"${latest.metadata.url}/email$emailJsonSuffix"
      val urlWithoutSlash = if (url.startsWith("/")) url.drop(1) else url

      InternalRedirect.internalRedirect("type/article", urlWithoutSlash, Some(queryString))

    case (Some(latest), false) =>
      Found(latest.metadata.url)

    case (_, _) =>
      NotFound
  }

  // this is simply the latest by date. No lead content, editors picks, or anything else
  private def loadLatest(path: String)(implicit request: RequestHeader): Future[Option[IndexPage]] = {
    val result = contentApiClient.getResponse(
      contentApiClient.item(s"/$path", Edition(request))
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
