package commercial

import commercial.feeds._
import common.{AkkaAsync, ExecutionContexts, Jobs, Logging}
import conf.Configuration.commercial.merchandisingFeedsRoot
import model.commercial.books.BestsellersAgent
import model.commercial.jobs.Industries
import model.commercial.masterclasses.{MasterClassAgent, MasterClassTagsAgent}
import model.commercial.money.BestBuysAgent
import model.commercial.travel.{Countries, TravelOffersAgent}
import model.diagnostics.CloudWatch
import play.api.{Application => PlayApp, GlobalSettings}
import services.S3

import scala.concurrent.duration._
import scala.util.control.NonFatal
import scala.util.{Failure, Random, Success}

trait CommercialLifecycle extends GlobalSettings with Logging with ExecutionContexts {

  private val refreshJobs: List[RefreshJob] = List(
    MasterClassTagsRefresh,
    MasterclassesRefresh,
    CountriesRefresh,
    IndustriesRefresh,
    MoneyBestBuysRefresh,
    BooksRefresh,
    TravelOffersRefresh
  )

  private def recordEvent(feedName: String, eventName: String, maybeDuration: Option[Duration]): Unit = {
    val key = s"${feedName.toLowerCase.replaceAll("[\\s/]+", "-")}-$eventName-time"
    val duration = maybeDuration map (_.toMillis.toDouble) getOrElse -1d
    CloudWatch.put("Commercial", Map(s"$key" -> duration))
  }

  override def onStart(app: PlayApp): Unit = {

    def randomStartSchedule(minsLater: Int = 0) = s"0 ${Random.nextInt(15) + minsLater}/15 * * * ?"

    def fetchFeed(fetcher: FeedFetcher): Unit = {

      val feedName = fetcher.feedName

      def storeFeed(feed: Feed): Unit =
        S3.putPrivate(key = s"$merchandisingFeedsRoot/$feedName", value = feed.content, feed.contentType)

      def recordFetch(maybeDuration: Option[Duration]): Unit = {
        recordEvent(feedName, "fetch", maybeDuration)
      }

      val msgPrefix = s"Fetching $feedName feed"
      log.info(s"Fetching $feedName feed from ${fetcher.url} ...")
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
          storeFeed(response.feed)
          recordFetch(Some(response.duration))
          log.info(s"$msgPrefix succeeded in ${response.duration}")
      }
    }

    def parseFeed[T](parser: FeedParser[T]): Unit = {

      val feedName = parser.feedName

      def recordParse(maybeDuration: Option[Duration]): Unit = {
        recordEvent(feedName, "parse", maybeDuration)
      }

      log.info(s"Parsing $feedName feed ...")
      val parsedFeed = parser.parse()
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
      val feedName = fetcher.feedName
      Jobs.deschedule(s"${feedName}FetchJob")
      Jobs.scheduleEveryNMinutes(s"${feedName}FetchJob", 15) {
        fetchFeed(fetcher)
      }
    }

    for (parser <- FeedParser.all) {
      val feedName = parser.feedName
      Jobs.deschedule(s"${feedName}ParseJob")
      Jobs.scheduleEveryNMinutes(s"${feedName}ParseJob", 15) {
        parseFeed(parser)
      }
    }

    refreshJobs.zipWithIndex foreach {
      case (job, i) => job.start(randomStartSchedule(minsLater = i))
    }

    AkkaAsync {

      MasterClassTagsAgent.refresh() andThen {
        case Success(_) => MasterClassAgent.refresh()
        case Failure(e) => log.warn(s"Failed to refresh master class tags: ${e.getMessage}")
      }

      Countries.refresh() andThen {
        case Success(_) => TravelOffersAgent.refresh()
        case Failure(e) => log.warn(s"Failed to refresh travel offer countries: ${e.getMessage}")
      }

      Industries.refresh() onFailure {
        case NonFatal(e) => log.warn(s"Failed to refresh job industries: ${e.getMessage}")
      }

      BestBuysAgent.refresh()

      BestsellersAgent.refresh()
      TravelOffersRefresh.refresh()

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
      Jobs.deschedule(s"${fetcher.feedName}FetchJob")
    }

    for (parser <- FeedParser.all) {
      Jobs.deschedule(s"${parser.feedName}ParseJob")
    }

    super.onStop(app)
  }
}
