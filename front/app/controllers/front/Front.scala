package controllers.front

import model.TrailblockDescription
import model.Trailblock
import akka.actor.Cancellable
import common.{ Logging, AkkaSupport }

import scala.concurrent.duration._

import views.support.{ Featured, Thumbnail, Headline }
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }

//Responsible for holding the definition of the two editions
//and bootstrapping the front (setting up the refresh schedule)
class Front extends AkkaSupport with Logging {

  val refreshDuration = 60.seconds

  private lazy val refreshSchedule = play_akka.scheduler.every(refreshDuration, initialDelay = 5.seconds) {
    log.info("Refreshing Front")
    Front.refresh()
  }

  lazy val ukEditions = Map(

    "front" -> new ConfiguredEdition("UK", Seq(
      TrailblockDescription("", "News", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("sport", "Sport", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 3, style = Some(Featured), showMore = true),
      TrailblockDescription("culture", "Culture", numItemsVisible = 3, style = Some(Thumbnail), showMore = true),
      TrailblockDescription("business", "Business", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("lifeandstyle", "Life and style", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("technology", "Technology", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("money", "Money", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("travel", "Travel", numItemsVisible = 1, style = Some(Thumbnail))
    )),

    "sport" -> new FrontEdition("UK", Seq(
      TrailblockDescription("sport", "Sport", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("football", "Football", numItemsVisible = 3, style = Some(Featured), showMore = true),
      TrailblockDescription("sport/cricket", "Cricket", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/rugby-union", "Rugby Union", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/motorsports", "Motor Sport", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/tennis", "Tennis", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/golf", "Golf", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/horse-racing", "Horse Racing", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("sport/rugbyleague", "Rugby League", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("sport/us-sport", "US Sport", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("sport/boxing", "Boxing", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("sport/cycling", "Cycling", numItemsVisible = 1, style = Some(Headline))
    )),

    "culture" -> new FrontEdition("UK", Seq(
      TrailblockDescription("culture", "Culture", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("tv-and-radio", "TV & Radio", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("film", "Film", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("music", "Music", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("stage", "Stage", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("books", "Books", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("artanddesign", "Art & Design", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("technology/games", "Games", numItemsVisible = 1, style = Some(Headline))
    ))
  )

  lazy val usEditions = Map(

    "front" -> new ConfiguredEdition("US", Seq(
      TrailblockDescription("", "News", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("sport", "Sports", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("commentisfree", "Comment is free", numItemsVisible = 3, style = Some(Featured), showMore = true),
      TrailblockDescription("culture", "Culture", numItemsVisible = 3, style = Some(Thumbnail), showMore = true),
      TrailblockDescription("business", "Business", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("lifeandstyle", "Life and style", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("technology", "Technology", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("travel", "Travel", numItemsVisible = 1, style = Some(Thumbnail))
    )),

    "sport" -> new FrontEdition("US", Seq(
      TrailblockDescription("sport", "Sports", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("sport/nfl", "NFL", numItemsVisible = 3, style = Some(Featured)),
      TrailblockDescription("sport/mlb", "MLB", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/nba", "NBA", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("football/mls", "MLS", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("sport/nhl", "NHL", numItemsVisible = 1, style = Some(Thumbnail))
    )),

    "culture" -> new FrontEdition("US", Seq(
      TrailblockDescription("culture", "Culture", numItemsVisible = 5, style = Some(Featured), showMore = true),
      TrailblockDescription("film", "Film", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("music", "Music", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("stage", "Stage", numItemsVisible = 1, style = Some(Thumbnail)),
      TrailblockDescription("books", "Books", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("artanddesign", "Art & Design", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("technology/games", "Games", numItemsVisible = 1, style = Some(Headline)),
      TrailblockDescription("tv-and-radio", "TV & Radio", numItemsVisible = 1, style = Some(Thumbnail))
    ))

  )

  private def allFronts = ukEditions.toSeq ++ usEditions.toSeq

  def refresh() {
    allFronts.foreach { case (name, front) => front.refresh() }
  }

  def shutdown() {
    refreshSchedule.cancel()
    allFronts.foreach { case (name, front) => front.shutDown() }
  }

  def startup() {
    refreshSchedule
  }

  def apply(path: String, edition: String): Seq[Trailblock] = edition match {
    case "US" => usEditions(path)()
    case anythingElse => ukEditions(path)()
  }

  lazy val warmup = {
    refresh()
    allFronts.foreach { case (name, front) => front.warmup }
  }
}

object Front extends Front

case class FrontStats(nukUkTrails: Int, numUsTrails: Int)