package commercial

import commercial.feeds._
import common._
import model.commercial.jobs.Industries
import model.commercial.events.MasterclassTagsAgent
import model.commercial.money.BestBuysAgent
import model.commercial.travel.Countries
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Random
import scala.util.control.NonFatal

class CommercialLifecycle(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent with Logging {

  appLifecycle.addStopHook { () => Future {
    stop()
  }}

  private val refreshJobs: List[RefreshJob] = List(
    CommercialMetricsUpdate,
    MasterClassTagsRefresh,
    CountriesRefresh,
    IndustriesRefresh,
    MoneyBestBuysRefresh
  )

  override def start(): Unit = {

    def randomStartSchedule(minsLater: Int = 0) = s"0 ${Random.nextInt(15) + minsLater}/15 * * * ?"

    def fetchFeed(fetcher: FeedFetcher): Future[Unit] = {
      val feedName = fetcher.feedMetaData.name

      val msgPrefix = s"Fetching $feedName feed"
      log.info(s"$msgPrefix from ${fetcher.feedMetaData.url} ...")
      val eventualResponse = fetcher.fetch()
      eventualResponse onFailure {
        case e: SwitchOffException =>
          log.warn(s"$msgPrefix failed: ${e.getMessage}")
        case NonFatal(e) =>
          CommercialLifecycleMetrics.logMetric(CommercialFeedEvent(feedName, FeedAction.Fetch, false))
          log.error(s"$msgPrefix failed: ${e.getMessage}", e)
      }
      eventualResponse onSuccess {
        case response =>
          S3FeedStore.put(feedName, response.feed)
          CommercialLifecycleMetrics.logMetric(CommercialFeedEvent(feedName, FeedAction.Fetch, true))
          log.info(s"$msgPrefix succeeded in ${response.duration}")
      }
      eventualResponse.map(_ => ())
    }

    def parseFeed[T](parser: FeedParser[T]): Future[Unit] = {

      val feedName = parser.feedMetaData.name

      val msgPrefix = s"Parsing $feedName feed"
      log.info(s"$msgPrefix ...")
      val parsedFeed = parser.parse(S3FeedStore.get(parser.feedMetaData.name))
      parsedFeed onFailure {
        case e: SwitchOffException =>
          log.warn(s"$msgPrefix failed: ${e.getMessage}")
        case NonFatal(e) =>
          CommercialLifecycleMetrics.logMetric(CommercialFeedEvent(feedName, FeedAction.Parse, false))
          log.error(s"$msgPrefix failed: ${e.getMessage}", e)
      }
      parsedFeed onSuccess {
        case feed =>
          CommercialLifecycleMetrics.logMetric(CommercialFeedEvent(feedName, FeedAction.Parse, true))
          log.info(s"$msgPrefix succeeded: parsed ${feed.contents.size} $feedName in ${feed.parseDuration}")
      }
      parsedFeed.map(_ => ())
    }

    def mkJobName(feedName: String, task: String): String = s"${feedName.replaceAll("/", "-")}-$task-job"

    for (fetcher <- FeedFetcher.all) {
      val feedName = fetcher.feedMetaData.name
      val jobName = mkJobName(feedName, "fetch")
      Jobs.deschedule(jobName)
      Jobs.scheduleEveryNMinutes(jobName, 15) {
        fetchFeed(fetcher)
      }
    }

    for (parser <- FeedParser.all) {
      val feedName = parser.feedMetaData.name
      val jobName = mkJobName(feedName, "parse")
      Jobs.deschedule(jobName)
      Jobs.scheduleEveryNMinutes(jobName, 15) {
        parseFeed(parser)
      }
    }

    refreshJobs.zipWithIndex foreach {
      case (job, i) => job.start(randomStartSchedule(minsLater = i))
    }

    AkkaAsync {

      MasterclassTagsAgent.refresh() onFailure {
        case NonFatal(e) => log.warn(s"Failed to refresh masterclass tags: ${e.getMessage}")
      }

      Countries.refresh() onFailure {
        case NonFatal(e) => log.warn(s"Failed to refresh travel offer countries: ${e.getMessage}")
      }

      Industries.refresh() onFailure {
        case NonFatal(e) => log.warn(s"Failed to refresh job industries: ${e.getMessage}")
      }

      BestBuysAgent.refresh()

      CommercialMetricsUpdate.refresh()

      for (fetcher <- FeedFetcher.all) {
        fetchFeed(fetcher)
      }

      for (parser <- FeedParser.all) {
        parseFeed(parser)
      }
    }
  }

  def stop(): Unit = {
    refreshJobs foreach (_.stop())

    for (fetcher <- FeedFetcher.all) {
      Jobs.deschedule(s"${fetcher.feedMetaData.name}FetchJob")
    }

    for (parser <- FeedParser.all) {
      Jobs.deschedule(s"${parser.feedMetaData.name}ParseJob")
    }
  }
}
