package commercial.controllers

import commercial.model.capi.{CapiAgent, CapiMultiple, CapiSingle, Lookup}
import common.{Edition, ExecutionContexts, JsonComponent, Logging}
import contentapi.ContentApiClient
import layout.PaidCard
import model.{Cached, ContentType, NoCache}
import play.api.mvc._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal

sealed abstract class SponsorType(val className: String)
case object PaidFor extends SponsorType("paidfor")
case object Supported extends SponsorType("supported")

class ContentApiOffersController(contentApiClient: ContentApiClient, capiAgent: CapiAgent) extends Controller with ExecutionContexts with implicits.Requests with Logging {

  private val lookup = new Lookup(contentApiClient)

  private def retrieveContent()(implicit request: Request[AnyContent]): Future[List[ContentType]]  = {

    val optKeyword = request.getParameter("k")

    val latestContent = optKeyword.map { keyword =>
      // getting twice as many, as we filter out content without images
      lookup.latestContentByKeyword(keyword, 8)
    }.getOrElse(Future.successful(Nil))

    latestContent onFailure {
      case NonFatal(e) => log.error(s"Looking up content by keyword failed: ${e.getMessage}")
    }

    val specificContent: Future[Seq[model.ContentType]] = capiAgent.contentByShortUrls(specificIds)

    specificContent onFailure {
      case NonFatal(e) => log.error(s"Looking up content by short URL failed: ${e.getMessage}")
    }

    val futureContents = for {
      specific <- specificContent
      latestByKeyword <- latestContent
    } yield {
      (specific ++ latestByKeyword.filter(_.trail.trailPicture.nonEmpty)).distinct take 4
    }

    futureContents.map(_.toList)
  }

  private def renderNative(isMulti: Boolean) = Action.async { implicit request =>

    retrieveContent().map {
      case Nil => Cached(componentNilMaxAge){ jsonFormat.nilResult }
      case content if isMulti => Cached(60.seconds) {
        JsonComponent(CapiMultiple.fromContent(content, Edition(request)))
      }
      case first :: _ => Cached(60.seconds) {
        JsonComponent(CapiSingle.fromContent(first, Edition(request)))
      }
    }

  }

  def nativeJson = renderNative(isMulti = false)
  def nativeJsonMulti = renderNative(isMulti = true)
}
