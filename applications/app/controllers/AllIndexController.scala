package controllers

import com.gu.contentapi.client.utils.CapiModelEnrichment.RichCapiDateTime
import common.Edition.defaultEdition
import common.{Edition, ExecutionContexts, Logging}
import contentapi.{ContentApiClient, SectionsLookUp}
import implicits.{Dates, ItemResponses}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTime, DateTimeZone}
import play.api.mvc.{Action, Controller, RequestHeader}
import services.{ConfigAgent, IndexPage, IndexPageItem}
import views.support.PreviousAndNext

import scala.concurrent.Future

class AllIndexController(contentApiClient: ContentApiClient, sectionsLookUp: SectionsLookUp)(implicit context: ApplicationContext) extends Controller with ExecutionContexts with ItemResponses with Dates with Logging {

  private val indexController = new IndexController(contentApiClient, sectionsLookUp)

  // no need to set the zone here, it gets it from the date.
  private val dateFormatUTC = DateTimeFormat.forPattern("yyyy/MMM/dd").withZone(DateTimeZone.UTC)

  private def requestedDate(dateString: String) = {
    dateFormatUTC
      .parseDateTime(dateString)
      .withTimeAtStartOfDay()
      .plusDays(1)
      .minusSeconds(1)
      .toDateTime
  }

  def altDate(path: String, day: String, month: String, year: String) = Action.async{ implicit request =>
    val reqDate = requestedDate(s"$year/$month/$day").withTimeAtStartOfDay()
    findByDate(path, reqDate).map{ _.map{ date =>
      Found(s"/$path/${urlFormat(date)}/all")
    }.getOrElse(Found(s"/$path/all"))}
  }

  // redirect old dated pages e.g. /sport/cycling/2011/jan/05 to new format /sport/cycling/2011/jan/05/all
  def on(path: String) = Action { implicit request =>
    Cached(300)(WithoutRevalidationResult(MovedPermanently(s"/$path/all")))
  }

  def all(path: String) = Action.async { implicit request =>
    val edition = Edition(request)

    if (ConfigAgent.shouldServeFront(path) || defaultEdition.isEditionalised(path)) {
      indexController.render(path)(request)
    } else {
      /** No front exists, so 'all' is the same as the tag page - redirect there */
      Future.successful(Cached(300)(WithoutRevalidationResult(MovedPermanently(s"/$path"))))
    }
  }

  def allOn(path: String, day: String, month: String, year: String) = Action.async { implicit request =>
    val reqDate = requestedDate(s"$year/$month/$day")

    loadLatest(path, reqDate).map { _.map { index =>

      val contentOnRequestedDate = index.contents.filter(_.item.trail.webPublicationDate.sameDay(reqDate))

      val olderDate = index.trails.find(!_.trail.webPublicationDate.sameDay(reqDate)).map(_.trail.webPublicationDate.toDateTime)

      if (index.trails.isEmpty) {
        Cached(300)(WithoutRevalidationResult(redirectToFirstAllPage(path)))
      } else if (contentOnRequestedDate.isEmpty) {
        Cached(300)(WithoutRevalidationResult(redirectToOlderAllPage(olderDate, path)))
      } else {
        val prevPage = {
          olderDate match {
            case Some(older) => Some(s"/$path/${urlFormat(older)}/all")
            case _ => Some(s"/$path/${urlFormat(reqDate.minusDays(1))}/altdate")
          }
        }
        val today = DateTime.now
        val nextPage = if (reqDate.sameDay(today)) None else Some(s"/$path/${urlFormat(reqDate.plusDays(1))}/altdate")
        val model = index.copy(contents = contentOnRequestedDate, tzOverride = Some(DateTimeZone.UTC))

        Cached(300)(RevalidatableResult.Ok(views.html.all(model, PreviousAndNext(prevPage, nextPage))))
      }
    }.getOrElse(Cached(300)(WithoutRevalidationResult(NotFound)))}
  }

  private def redirectToOlderAllPage(olderDate: Option[DateTime], path: String) = olderDate.map {
    older => {
      val olderStartOfDay = older.withTimeAtStartOfDay().withZone(DateTimeZone.UTC)
      Found(s"/$path/${urlFormat(olderStartOfDay)}/all")
    }
  }.getOrElse(NotFound)

  private def redirectToFirstAllPage(path: String) = Found(s"/$path/all")

  // this is simply the latest by date. No lead content, editors picks, or anything else
  private def loadLatest(path: String, date: DateTime)(implicit request: RequestHeader): Future[Option[IndexPage]] = {
    val result = contentApiClient.getResponse(
      contentApiClient.item(s"/$path", Edition(request)).pageSize(50).toDate(date).orderBy("newest")
    ).map{ item =>
      item.section.map( section =>
        IndexPage(
          page = Section.make(section),
          contents = item.results.getOrElse(Nil).map(IndexPageItem(_)),
          Tags(Nil),
          date,
          tzOverride = None
        )
      ).orElse(item.tag.map( apitag => {
        val tag = Tag.make(apitag)
        IndexPage(page = tag, contents = item.results.getOrElse(Nil).map(IndexPageItem(_)), Tags(List(tag)), date, tzOverride = None)
      }))
    }

    result.recover{ case e: Exception =>
      log.error(s"Cannot fetch content for path '$path'", e)
      None
    }
  }

  private def findByDate(path: String, date: DateTime)(implicit request: RequestHeader): Future[Option[DateTime]] = {
    val result = contentApiClient.getResponse(
      contentApiClient.item(s"/$path", Edition(request))
        .pageSize(1)
        .fromDate(date)
        .orderBy("oldest")
    ).map{ item =>
      item.results.getOrElse(Nil).headOption.flatMap(_.webPublicationDate).map(_.toJodaDateTime.withZone(DateTimeZone.UTC))
    }
    result.recover{ case e: Exception =>
      log.error(s"Cannot fetch content for path '$path'", e)
      None
    }
  }

  private def urlFormat(date: DateTime) = date.toString(dateFormatUTC).toLowerCase
}
