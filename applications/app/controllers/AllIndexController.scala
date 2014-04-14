package controllers

import play.api.mvc.{RequestHeader, Action, Controller}
import scala.concurrent.Future
import conf.SwitchingContentApi
import common.{Logging, ExecutionContexts, Edition}
import model.{Cached, Tag, Content, Section}
import services.IndexPage
import views.support.{PreviousAndNext, TemplateDeduping}
import org.joda.time.format.DateTimeFormat
import org.joda.time.DateTime
import implicits.{ItemResponses, Dates}

object AllIndexController extends Controller with ExecutionContexts with ItemResponses with Dates with Logging {

  private val dateFormat = DateTimeFormat.forPattern("yyyy/MMM/dd")

  def newer(path: String, day: String, month: String, year: String) = Action.async{ implicit request =>
    findNewer(path, dateFormat.parseDateTime(s"$year/$month/$day")).map{ _.map{ date =>
      Found(s"/$path/${date.toString(dateFormat).toLowerCase}/all")
    }.getOrElse(Found(s"/$path/all"))}
  }

  // redirect old dated pages e.g. /sport/cycling/2011/jan/05 to new format /sport/cycling/2011/jan/05/all
  def on(path: String) = Action { implicit request =>
    Cached(300)(MovedPermanently(s"/$path/all"))
  }

  def all(path: String) = Action.async { implicit request =>

    implicit val dedupe = TemplateDeduping()

    loadLatest(path).map { _.map { index =>
      Ok(views.html.all(index, PreviousAndNext(Some(s"/$path/${DateTime.now.minusDays(1).toString(dateFormat).toLowerCase}/all"), None)))
    }.getOrElse(NotFound)}.map(Cached(300)(_))
  }

  def allOn(path: String, day: String, month: String, year: String) = Action.async{ implicit request =>

    val requestedDate = dateFormat.parseDateTime(s"$year/$month/$day").toDateMidnight.plusDays(1).toDateTime.minusSeconds(1)

    implicit val dedupe = TemplateDeduping()

    loadLatest(path, requestedDate).map { _.map { index =>


      val contentOnRequestedDate = index.trails.filter(_.webPublicationDate.sameDay(requestedDate))

      val olderDate = index.trails.find(!_.webPublicationDate.sameDay(requestedDate)).map(_.webPublicationDate)

      if (index.trails.isEmpty) {
        // you have gone too far back in time - bounce to first xxxx/all page
        Found(s"/$path/all")
      } else if (contentOnRequestedDate.isEmpty) {
        // we are on a date that has no content, however we do know of the next older date that has content
        // so redirect there
        olderDate.map{ older => Found(s"/$path/${older.toString(dateFormat).toLowerCase}/all") }.getOrElse(NotFound)
      } else {
        // we have content for requested date, so show it

        val prevPageDate = olderDate.getOrElse(requestedDate.minusDays(1))
        val prevPage = Some(s"/$path/${prevPageDate.toString(dateFormat).toLowerCase}/all")
        val nextPage = if (requestedDate.isToday) None else Some(s"/$path/${requestedDate.plusDays(1).toString(dateFormat).toLowerCase}/newer")

        val model = index.copy(trails = contentOnRequestedDate)

        Ok(views.html.all(model, PreviousAndNext(prevPage, nextPage)))
      }
    }.getOrElse(NotFound)}.map(Cached(300)(_))
  }


  // this is simply the latest by date. No lead content, editors picks, or anything else
  private def loadLatest(path: String, date: DateTime = DateTime.now)(implicit request: RequestHeader): Future[Option[IndexPage]] = {
    val result = SwitchingContentApi().item(s"/$path", Edition(request)).pageSize(50).toDate(date).orderBy("newest").response.map{ item =>
      item.section.map( section =>
        IndexPage(Section(section), item.results.map(Content(_)), date)
      ).orElse(item.tag.map( tag =>
        IndexPage(Tag(tag), item.results.map(Content(_)), date)
      ))
    }

    result.recover{ case e: Exception =>
      log.error(e.getMessage, e)
      None
    }
  }

  private def findNewer(path: String, date: DateTime)(implicit request: RequestHeader): Future[Option[DateTime]] = {
    val result = SwitchingContentApi().item(s"/$path", Edition(request)).pageSize(1).fromDate(date).orderBy("oldest").response.map{ item =>
      item.results.headOption.map(_.webPublicationDate)
    }
    result.recover{ case e: Exception =>
      log.error(e.getMessage, e)
      None
    }
  }
}
