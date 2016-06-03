package headlines

import com.google.gdata.client.spreadsheet.{FeedURLFactory, SpreadsheetService}
import com.google.gdata.data.spreadsheet.{CellFeed, ListFeed, WorksheetFeed}
import common._
import layout.{EditionalisedLink, ContentCard}
import mvt.{ABHeadlinesTestControl, ABHeadlinesTestVariant}
import play.api.GlobalSettings
import play.api.inject.ApplicationLifecycle
import play.api.mvc.RequestHeader
import scala.collection.JavaConversions._
import scala.concurrent.{ExecutionContext, Future, blocking}
import conf.Configuration
import Function.const

object ABHeadlines extends ExecutionContexts with Logging {

  private val agent = AkkaAgent(Map.empty[String, String])

  private lazy val spreadsheetUrl = FeedURLFactory.getDefault
    .getWorksheetFeedUrl(Configuration.headlines.spreadsheet, "public", "values")

  private lazy val service = {
    val s = new SpreadsheetService("theguardian-website")
    s.setProtocolVersion(SpreadsheetService.Versions.V3)
    s
  }

  private def getHeadline(id: String): Option[String] = agent.get().get(id)

  def refresh(): Unit = if (ABHeadlinesTestVariant.switch.isSwitchedOn) {
    Future {
      blocking {
        val spreadsheet = service.getFeed(spreadsheetUrl, classOf[WorksheetFeed])
        spreadsheet.getEntries.headOption.foreach { worksheet =>
          val feed = service.getFeed(worksheet.getCellFeedUrl, classOf[CellFeed])
          val cells = feed.getEntries
          if (cells.length == 5) {  //if it is a different value someone has messed with the spreadsheet
            val testHeadline = cells(3).getCell.getValue -> cells(4).getCell.getValue
            agent.send(Map(testHeadline))
          } else {
            agent.send(Map.empty[String, String])
          }
          log.info(s"Updated ABHeadlines with ${agent.get()}")
        }
      }
    }
  }

  def upgrade(item: ContentCard)(implicit request: RequestHeader): ContentCard = {
    inHeadlineChangedVariant(item)
      .orElse(inControlGroup(item))
      .getOrElse(item)
  }

  private def inControlGroup(item: ContentCard)(implicit request: RequestHeader): Option[ContentCard] = {
    item.id
      .filter(const(ABHeadlinesTestControl.isParticipating))
      .filter(const(isUsFront(request)))
      .flatMap { id =>
        getHeadline(id).map { newHeadline =>
          val newUrl = EditionalisedLink(s"${item.header.url.baseUrl}#headline-control")
          item.copy(
            header = item.header.copy(url = newUrl)
          )
        }
      }
  }

  private def inHeadlineChangedVariant(item: ContentCard)(implicit request: RequestHeader): Option[ContentCard] = {
    item.id
      .filter(const(ABHeadlinesTestVariant.isParticipating))
      .filter(const(isUsFront(request)))
      .flatMap { id =>
        getHeadline(id).map { newHeadline =>
          val newUrl = EditionalisedLink(s"${item.header.url.baseUrl}#headline-variant")
          item.copy(
            header = item.header.copy(headline = newHeadline, url = newUrl)
          )
        }
      }
  }

  private def isUsFront(req: RequestHeader) = req.path == "/us"
}

class ABHeadlinesLifecycle(appLifeCycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent {

  private val ABHeadlinesJob = "ABHeadlinesJob"

  appLifeCycle.addStopHook { () => Future {
    Jobs.deschedule(ABHeadlinesJob)
  }}

  override def start(): Unit = {
    //runs once a minute
    Jobs.schedule(ABHeadlinesJob, "0 * * * * ?") {
      ABHeadlines.refresh()
    }
    AkkaAsync{
      ABHeadlines.refresh()
    }
  }
}

