package commercial

import commercial.feeds._
import common.{AkkaAsync, ExecutionContexts, Jobs, Logging}
import model.commercial.jobs.Industries
import model.commercial.masterclasses.MasterClassTagsAgent
import model.commercial.money.BestBuysAgent
import model.commercial.travel.Countries
import model.diagnostics.CloudWatch
import play.api.{Application => PlayApp, GlobalSettings}

import scala.concurrent.duration._
import scala.util.Random
import scala.util.control.NonFatal

trait CommercialLifecycle extends GlobalSettings with Logging with ExecutionContexts {

  private val refreshJobs: List[RefreshJob] = List(
    MasterClassTagsRefresh,
    CountriesRefresh,
    IndustriesRefresh,
    MoneyBestBuysRefresh
  )

  private def recordEvent(feedName: String, eventName: String, maybeDuration: Option[Duration]): Unit = {
    val key = s"${feedName.toLowerCase.replaceAll("[\\s/]+", "-")}-$eventName-time"
    val duration = maybeDuration map (_.toMillis.toDouble) getOrElse -1d
    CloudWatch.put("Commercial", Map(s"$key" -> duration))
  }

  override def onStart(app: PlayApp): Unit = {

    def randomStartSchedule(minsLater: Int = 0) = s"0 ${Random.nextInt(15) + minsLater}/15 * * * ?"

    def fetchFeed(fetcher: FeedFetcher): Unit = {

      val feedName = fetcher.feedMetaData.name

      def recordFetch(maybeDuration: Option[Duration]): Unit = {
        recordEvent(feedName, "fetch", maybeDuration)
      }

      val msgPrefix = s"Fetching $feedName feed"
      log.info(s"$msgPrefix from ${fetcher.feedMetaData.url} ...")
      val eventualResponse = fetcher.fetch()
      eventualResponse onFailure {
        case e: SwitchOffException =>
          log.warn(s"$msgPrefix failed: ${e.getMessage}")
        case NonFatal(e) =>
          recordFetch(None)
          log.error(s"$msgPrefix failed: ${e.getMessage}", e)
      }
      eventualResponse onSuccess {
        case response =>
          S3FeedStore.put(feedName, response.feed)
          recordFetch(Some(response.duration))
          log.info(s"$msgPrefix succeeded in ${response.duration}")
      }
    }

    def parseFeed[T](parser: FeedParser[T]): Unit = {

      val feedName = parser.feedMetaData.name

      def recordParse(maybeDuration: Option[Duration]): Unit = {
        recordEvent(feedName, "parse", maybeDuration)
      }

      log.info(s"Parsing $feedName feed ...")
      val parsedFeed = parser.parse(S3FeedStore.get(parser.feedMetaData.name))
      parsedFeed onFailure {
        case NonFatal(e) =>
          recordParse(None)
          log.error(s"Parsing $feedName feed failed: ${e.getMessage}", e)
      }
      parsedFeed onSuccess {
        case feed =>
          recordParse(Some(feed.parseDuration))
          log.info(s"Successfully parsed ${feed.contents.size} $feedName in ${feed.parseDuration}")
      }
    }

    super.onStart(app)

    for (fetcher <- FeedFetcher.all) {
      val feedName = fetcher.feedMetaData.name
      Jobs.deschedule(s"${feedName}FetchJob")
      Jobs.scheduleEveryNMinutes(s"${feedName}FetchJob", 15) {
        fetchFeed(fetcher)
      }
    }

    for (parser <- FeedParser.all) {
      val feedName = parser.feedMetaData.name
      Jobs.deschedule(s"${feedName}ParseJob")
      Jobs.scheduleEveryNMinutes(s"${feedName}ParseJob", 15) {
        parseFeed(parser)
      }
    }

    refreshJobs.zipWithIndex foreach {
      case (job, i) => job.start(randomStartSchedule(minsLater = i))
    }

    AkkaAsync {

      MasterClassTagsAgent.refresh() onFailure {
        case NonFatal(e) => log.warn(s"Failed to refresh master class tags: ${e.getMessage}")
      }

      Countries.refresh() onFailure {
        case NonFatal(e) => log.warn(s"Failed to refresh travel offer countries: ${e.getMessage}")
      }

      Industries.refresh() onFailure {
        case NonFatal(e) => log.warn(s"Failed to refresh job industries: ${e.getMessage}")
      }

      BestBuysAgent.refresh()

      for (fetcher <- FeedFetcher.all) {
        fetchFeed(fetcher)
      }

      for (parser <- FeedParser.all) {
        parseFeed(parser)
      }
    }
  }

  override def onStop(app: PlayApp): Unit = {
    refreshJobs foreach (_.stop())

    for (fetcher <- FeedFetcher.all) {
      Jobs.deschedule(s"${fetcher.feedMetaData.name}FetchJob")
    }

    for (parser <- FeedParser.all) {
      Jobs.deschedule(s"${parser.feedMetaData.name}ParseJob")
    }

    super.onStop(app)
  }
}
