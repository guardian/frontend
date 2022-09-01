package agents

import app.LifecycleComponent
import common.{AkkaAsync, Box, Edition, GuLogging, JobScheduler, editions}
import contentapi.ContentApiClient
import model.dotcomrendering.Trail.pressedContentToTrailWithoutRequest
import model.dotcomrendering.{OnwardCollectionResponse, Trail}
import play.api.inject.ApplicationLifecycle
import services.FaciaContentConvert

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class PopularInTagAgent(
    contentApiClient: ContentApiClient,
) extends GuLogging {
  private val trailsBox = Box[Seq[Trail]](Seq())
  def onwardsJourneyResponse = {
    OnwardCollectionResponse(
      heading = "Related Content",
      trails = trailsBox.get(),
    )
  }

  private def getPopularInTag(edition: Edition, tag: String, excludeTags: Seq[String] = Nil): Future[Seq[Trail]] = {

    val tags = (tag +: excludeTags.map(t => s"-$t")).mkString(",")

    val response = contentApiClient.getResponse(
      contentApiClient
        .search(edition)
        .tag(tags)
        .pageSize(50),
    )

    val trails: Future[Seq[Trail]] = response.map { response =>
      val items = response.results.map { apiContent =>
        pressedContentToTrailWithoutRequest(FaciaContentConvert.contentToFaciaContent(apiContent))
      }
      items.take(10) //todo: order by most popular
    }

    trails
  }

  def refresh(): Future[Unit] = {
//    Future.successful((): Unit)
    getPopularInTag(edition = editions.Uk, tag = "sport/cricket", Seq()).map(trailsBox.send)
  }

//  def refreshWith(): Future[Seq[Trail]]
}

