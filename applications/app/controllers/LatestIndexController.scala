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

class LatestIndexController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents)
    extends BaseController
    with ImplicitControllerExecutionContext
    with implicits.ItemResponses
    with GuLogging {

  def latest(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      loadLatest(path)
        .map {
          _.map { index =>
            index.page match {
              case tag: Tag if tag.isSeries || tag.isBlog => handleSeriesBlogs(index)
              case tag: Tag                               => MovedPermanently(s"${tag.metadata.url}/all")
              case section: Section                       =>
                val url =
                  if (section.isEditionalised) Paths.stripEditionIfPresent(section.metadata.url)
                  else section.metadata.url
                MovedPermanently(s"$url/all")
              case _ => NotFound
            }
          }.getOrElse(NotFound)
        }
        .map(r => Cached(300)(WithoutRevalidationResult(r)))
    }

  private def handleSeriesBlogs(index: IndexPage)(implicit request: RequestHeader) =
    index.trails.headOption match {
      case Some(latest) if request.isEmailJson || request.isEmailTxt || request.isHeadlineText =>
        // We perform an internal redirect for Braze. It cannot handle 30Xs
        emailInternalRedirect(latest)

      case Some(latest) if request.isEmail =>
        val queryString = request.campaignCode.fold(Map.empty[String, Seq[String]])(c => Map("CMP" -> Seq(c)))
        val url = s"${latest.metadata.url}/email"
        Redirect(url, queryString)

      case Some(latest) =>
        Found(latest.metadata.url).withHeaders("X-Robots-Tag" -> "noindex")

      case None =>
        NotFound
    }

  private def emailInternalRedirect(latest: Content)(implicit request: RequestHeader) = {
    val emailJsonSuffix = if (request.isEmailJson) EMAIL_JSON_SUFFIX else ""
    val emailTxtSuffix = if (request.isEmailTxt) EMAIL_TXT_SUFFIX else ""
    val headlineSuffix = if (request.isHeadlineText) HEADLINE_SUFFIX else ""

    val url = s"${latest.metadata.url}/email$emailTxtSuffix$emailJsonSuffix$headlineSuffix"
    val urlWithoutSlash = if (url.startsWith("/")) url.drop(1) else url

    InternalRedirect.internalRedirect("type/article", urlWithoutSlash, None)
  }

  // this is simply the latest by date. No lead content, editors picks, or anything else
  private def loadLatest(path: String)(implicit request: RequestHeader): Future[Option[IndexPage]] = {
    val result = contentApiClient
      .getResponse(
        contentApiClient
          .item(s"/$path", Edition(request))
          .pageSize(1)
          .orderBy("newest"),
      )
      .map { item =>
        item.section
          .map(section =>
            IndexPage(
              page = Section.make(section),
              contents = item.results.getOrElse(Nil).map(IndexPageItem(_)).toSeq,
              tags = Tags(Nil),
              date = DateTime.now,
              tzOverride = None,
            ),
          )
          .orElse(
            item.tag.map(tag =>
              IndexPage(
                page = Tag.make(tag),
                contents = item.results.getOrElse(Nil).map(IndexPageItem(_)).toSeq,
                tags = Tags(Nil),
                date = DateTime.now,
                tzOverride = None,
              ),
            ),
          )
      }

    result recover { case e: Exception =>
      logErrorWithRequestId(e.getMessage, e)
      None
    }
  }
}
