package agents

import common.editions.{Au, International, Uk, Us}
import common.{Box, Edition, GuLogging}
import contentapi.ContentApiClient
import model.dotcomrendering.Trail
import model.dotcomrendering.Trail.pressedContentToTrailWithoutRequest
import services.FaciaContentConvert

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class PopularInTagAgent(
    contentApiClient: ContentApiClient,
) extends GuLogging {
  private val trailsBoxWithProfessional = Box[Map[String, Trail]](Map.empty)
  private val trailsBox = Box[Map[String, Trail]](Map.empty)
  private def getPopularInTag(edition: Edition, tag: String, excludeTags: Seq[String] = Nil): Future[Seq[Trail]] = {

    val tags = (tag +: excludeTags.map(t => s"-$t")).mkString(",")

    val response = contentApiClient.getResponse(
      contentApiClient
        .search(edition)
        .tag(tags)
        .pageSize(50),
    )

    val trails = response.map { response =>
      val items = response.results.map { apiContent =>
        pressedContentToTrailWithoutRequest(FaciaContentConvert.contentToFaciaContent(apiContent))
      }

      items.take(10) //todo: order by most popular
    }

    trails
  }

  def refreshIndividualTag(edition: Edition, tag: String, excludeTags: Seq[String] = Seq(), trailBox: Box[Map[String, Trail]]) = {
    getPopularInTag(edition, tag, excludeTags)
      .map(trail => trailBox.send(_.updated(tag, trail)))
  }

  def refreshAllTags(edition: Edition, excludeTags: Seq[String] = Seq(), trailBox: Box[Map[String, Trail]]) = {
    Future.sequence(List(
      // sport tags
      refreshIndividualTag(edition, "sport/cricket", excludeTags, trailBox),
      refreshIndividualTag(edition, "sport/cricket", excludeTags, trailBox),
      refreshIndividualTag(edition, "sport/rugby-union", excludeTags, trailBox),
      refreshIndividualTag(edition, "sport/rugbyleague", excludeTags, trailBox),
      refreshIndividualTag(edition, "sport/formulaone", excludeTags, trailBox),
      refreshIndividualTag(edition, "sport/tennis", excludeTags, trailBox),
      refreshIndividualTag(edition, "sport/cycling", excludeTags, trailBox),
      refreshIndividualTag(edition, "sport/motorsports", excludeTags, trailBox),
      refreshIndividualTag(edition, "sport/golf", excludeTags, trailBox),
      refreshIndividualTag(edition, "sport/horse-racing", excludeTags, trailBox),
      refreshIndividualTag(edition, "sport/boxing", excludeTags, trailBox),
      refreshIndividualTag(edition, "sport/us-sport", excludeTags, trailBox),
      refreshIndividualTag(edition, "sport/australia-sport", excludeTags, trailBox),

      // football tags
      refreshIndividualTag(edition, "football/championsleague", excludeTags, trailBox),
      refreshIndividualTag(edition, "football/premierleague", excludeTags, trailBox),
      refreshIndividualTag(edition, "football/championship", excludeTags, trailBox),
      refreshIndividualTag(edition, "football/europeanfootball", excludeTags, trailBox),
      refreshIndividualTag(edition, "football/world-cup-2014", excludeTags, trailBox),

	    // football team tags
      refreshIndividualTag(edition, "football/manchester-united", excludeTags, trailBox),
      refreshIndividualTag(edition, "football/chelsea", excludeTags, trailBox),
      refreshIndividualTag(edition, "football/arsenal", excludeTags, trailBox),
      refreshIndividualTag(edition, "football/manchestercity", excludeTags, trailBox),
      refreshIndividualTag(edition, "football/tottenham-hotspur", excludeTags, trailBox),
      refreshIndividualTag(edition, "football/liverpool", excludeTags, trailBox),
    ))
  }

  def refresh() = {
    Future.sequence(Seq(
      refreshAllTags(Uk, Seq("tone/advertisement-features"), trailsBoxWithProfessional),
      refreshAllTags(Uk, Seq("tone/advertisement-features", "guardian-professional/guardian-professional"), trailsBox),

      refreshAllTags(Us, Seq("tone/advertisement-features"), trailsBoxWithProfessional),
      refreshAllTags(Us, Seq("tone/advertisement-features", "guardian-professional/guardian-professional"), trailsBox),

      refreshAllTags(Au, Seq("tone/advertisement-features"), trailsBoxWithProfessional),
      refreshAllTags(Au, Seq("tone/advertisement-features", "guardian-professional/guardian-professional"), trailsBox),

      refreshAllTags(International, Seq("tone/advertisement-features"), trailsBoxWithProfessional),
      refreshAllTags(International, Seq("tone/advertisement-features", "guardian-professional/guardian-professional"), trailsBox),
      )
    )
  }
}

