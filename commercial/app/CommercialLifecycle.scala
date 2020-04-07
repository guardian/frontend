package commercial

import java.util.concurrent.Executors

import commercial.model.merchandise.jobs.Industries
import app.LifecycleComponent
import commercial.model.feeds._
import common.LoggingField._
import common.{AkkaAsync, JobScheduler, Logging}
import metrics.MetricUploader
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

object CommercialMetrics {
  val metrics = MetricUploader("Commercial")
}

class CommercialLifecycle(
  appLifecycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync,
  feedsFetcher: FeedsFetcher,
  feedsParser: FeedsParser,
  industries: Industries) extends LifecycleComponent with Logging {

  // This class does work that should be kept separate from the EC used to serve requests
  implicit private val ec = ExecutionContext.fromExecutorService(
    Executors.newFixedThreadPool(10)
  )

  appLifecycle.addStopHook { () => Future {
    stop()
  }}

  private def toLogFields(feed: String,
                          action: String,
                          success: Boolean,
                          maybeDuration: Option[Long] = None,
                          maybeSize: Option[Int] = None) = {

    val prefix = "commercial-feed"

    val defaultFields: List[LogField] = List(
      prefix -> feed,
      s"$prefix-action" -> action,
      s"$prefix-result" -> (if (success) "success" else "failure")
    )

    val optionalFields: List[Option[LogField]] = List(
      maybeDuration map (LogFieldLong(s"$prefix-duration", _)),
      maybeSize map (LogFieldLong(s"$prefix-size", _))
    )

    defaultFields ::: optionalFields.flatten
  }

  private val refreshJobs: List[RefreshJob] = List(
    new IndustriesRefresh(industries, jobs)
  )

  override def start(): Unit = {

    def delayedStartSchedule(delayedStart: Int = 0, refreshStep: Int = 15) = s"0 $delayedStart/$refreshStep * * * ?"

    def fetchFeed(fetcher: FeedFetcher): Future[Unit] = {

      val feedName = fetcher.feedMetaData.name

      val msgPrefix = s"Fetching $feedName feed"
      log.info(s"$msgPrefix from ${fetcher.feedMetaData.url} ...")
      val eventualResponse = fetcher.fetch()
      eventualResponse.failed.foreach {
        case e: SwitchOffException =>
          log.warn(s"$msgPrefix failed: ${e.getMessage}")
        case NonFatal(e) =>
          logErrorWithCustomFields(s"$msgPrefix failed: ${e.getMessage}",
                                   e,
                                   toLogFields(feedName, "fetch", false))
      }
      eventualResponse.foreach {
        response =>
          S3FeedStore.put(feedName, response.feed)
          logInfoWithCustomFields(s"$msgPrefix succeeded in ${response.duration}",
                                  toLogFields(feedName, "fetch", true, Some(response.duration.toSeconds)))
      }
      eventualResponse.map(_ => ())
    }

    def parseFeed[T](parser: FeedParser[T]): Future[Unit] = {

      val feedName = parser.feedMetaData.name

      val msgPrefix = s"Parsing $feedName feed"
      log.info(s"$msgPrefix ...")
      val parsedFeed = parser.parse(S3FeedStore.get(parser.feedMetaData.name))
      parsedFeed.failed.foreach {
        case e: SwitchOffException =>
          log.warn(s"$msgPrefix failed: ${e.getMessage}")
        case NonFatal(e) =>
          logErrorWithCustomFields(s"$msgPrefix failed: ${e.getMessage}",
                                   e,
                                   toLogFields(feedName, "parse", false))
      }
      parsedFeed.foreach {
        feed =>
          logInfoWithCustomFields(s"$msgPrefix succeeded: parsed ${feed.contents.size} $feedName in ${feed.parseDuration}",
                                  toLogFields(feedName, "parse", true, Some(feed.parseDuration.toSeconds), Some(feed.contents.size)))
      }
      parsedFeed.map(_ => ())
    }

    def mkJobName(feedName: String, task: String): String = s"${feedName.replaceAll("/", "-")}-$task-job"

    val jobRefreshStep = 15

    for (fetcher <- feedsFetcher.all) {
      val feedName = fetcher.feedMetaData.name
      val jobName = mkJobName(feedName, "fetch")
      jobs.deschedule(jobName)
      jobs.scheduleEveryNMinutes(jobName, jobRefreshStep) {
        fetchFeed(fetcher)
      }
    }

    for (parser <- feedsParser.all) {
      val feedName = parser.feedMetaData.name
      val jobName = mkJobName(feedName, "parse")
      jobs.deschedule(jobName)
      jobs.scheduleEveryNMinutes(jobName, jobRefreshStep) {
        parseFeed(parser)
      }
    }

    val refreshJobDelay = jobRefreshStep / refreshJobs.size

    refreshJobs.zipWithIndex foreach {
      case (job, i) => job.start(delayedStartSchedule(delayedStart = i * refreshJobDelay, refreshStep = jobRefreshStep))
    }

    akkaAsync.after1s {

      industries.refresh().failed.foreach {
        case NonFatal(e) => log.warn(s"Failed to refresh job industries: ${e.getMessage}")
      }

      for (fetcher <- feedsFetcher.all) {
        fetchFeed(fetcher)
      }

      for (parser <- feedsParser.all) {
        parseFeed(parser)
      }
    }
  }

  def stop(): Unit = {
    refreshJobs foreach (_.stop())

    for (fetcher <- feedsFetcher.all) {
      jobs.deschedule(s"${fetcher.feedMetaData.name}FetchJob")
    }

    for (parser <- feedsParser.all) {
      jobs.deschedule(s"${parser.feedMetaData.name}ParseJob")
    }
  }
}
