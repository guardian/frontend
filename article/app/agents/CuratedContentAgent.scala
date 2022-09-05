package agents

import com.gu.contentapi.client.utils.format.{
  CulturePillar,
  LifestylePillar,
  NewsPillar,
  OpinionPillar,
  SportPillar,
  Theme,
}
import common._
import common.editions.{Au, International, Uk, Us}
import model.dotcomrendering.{OnwardCollectionResponse, Trail}
import model.facia.PressedCollection
import model.{FullAdFreeType, FullType, PressedPage, PressedPageType, dotcomrendering}
import play.api.inject.ApplicationLifecycle
import services.ConfigAgent
import services.fronts.FrontJsonFapiLive

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

case class ContainerMeta(theme: Theme, edition: Edition)

class CuratedContentAgent(frontJsonFapiLive: FrontJsonFapiLive) extends GuLogging {
  private lazy val curatedContentAgent = Box[Map[String, Seq[Trail]]](Map.empty)
  private lazy val curatedContentAdFreeAgent = Box[Map[String, Seq[Trail]]](Map.empty)

  private val CONTAINERS_WITH_EDITION: Map[String, ContainerMeta] = Map(
    "uk-alpha/news/regular-stories" -> ContainerMeta(NewsPillar, Uk),
    "c5cad9ee-584d-4e85-85cd-bf8ee481b026" -> ContainerMeta(NewsPillar, Us),
    "au-alpha/news/regular-stories" -> ContainerMeta(NewsPillar, Au),
    "10f21d96-18f6-426f-821b-19df55dfb831" -> ContainerMeta(NewsPillar, International),
    "754c-8e8c-fad9-a927" -> ContainerMeta(SportPillar, Uk),
    "f6dd-d7b1-0e85-4650" -> ContainerMeta(SportPillar, Us),
    "c45d-318f-896c-3a85" -> ContainerMeta(SportPillar, Au),
    "d1ad8ec3-5ee2-4673-94c8-cc3f8d261e52" -> ContainerMeta(SportPillar, International),
    "3ff78b30-52f5-4d30-ace8-c887113cbe0d" -> ContainerMeta(OpinionPillar, Uk),
    "98df412d-b0e7-4d9a-98c2-062642823e94" -> ContainerMeta(OpinionPillar, Us),
    "au-alpha/contributors/feature-stories" -> ContainerMeta(OpinionPillar, Au),
    "ee3386bb-9430-4a6d-8bca-b99d65790f3b" -> ContainerMeta(OpinionPillar, International),
    "ae511a89-ef38-4ec9-aab1-3a5ebc96d118" -> ContainerMeta(CulturePillar, Uk),
    "fb59c1f8-72a7-41d5-8365-a4d574809bed" -> ContainerMeta(CulturePillar, Us),
    "22262088-4bce-4290-9810-cb50bbead8db" -> ContainerMeta(CulturePillar, Au),
    "c7154e22-7292-4d93-a14d-22fd4b6b693d" -> ContainerMeta(CulturePillar, International),
    "uk-alpha/features/feature-stories" -> ContainerMeta(LifestylePillar, Uk),
    "us-alpha/features/feature-stories" -> ContainerMeta(LifestylePillar, Us),
    "13636104-51ce-4264-bb6b-556c80227331" -> ContainerMeta(LifestylePillar, Au),
    "7b297ef5-a3f9-45e5-b915-b54951d7f6ec" -> ContainerMeta(LifestylePillar, International),
  )

  private val EDITIONS_WITH_CONTAINER =
    for ((containerId, containerMeta) <- CONTAINERS_WITH_EDITION) yield (containerMeta, containerId)

  private def getPressedCollections(pageType: PressedPageType, paths: List[String], containerIds: List[String]) = {

    Future
      .sequence(
        paths
          .map { path =>
            frontJsonFapiLive
              .get(path, pageType)
              .map(_.map { faciaPage =>
                faciaPage.collections.filter { collection => containerIds.contains(collection.id) }
              })
          },
      )
      .map(_.flatten)
      .map(_.flatten)
  }

  private def getCuratedContent(pageType: PressedPageType, paths: List[String], containerIds: List[String]) = {
    getPressedCollections(pageType, paths, containerIds)
      .map { pressedCollections =>
        val onwardCollections = pressedCollections.map { pressedCollection =>
          val collectionId = pressedCollection.id
          val edition = CONTAINERS_WITH_EDITION(collectionId).edition
          val trails = pressedCollection.curatedPlusBackfillDeduplicated
            .take(10)
            .map(pressed => Trail.pressedContentToTrail(pressed, edition))

          collectionId -> trails
        }
        onwardCollections.toMap
      }
  }

  def getCuratedContentAdFree: Map[String, Seq[Trail]] = curatedContentAdFreeAgent.get()

  def getCuratedContent: Map[String, Seq[Trail]] = curatedContentAgent.get()

  def getTrails(theme: Theme, edition: Edition, isAdFree: Boolean) =
    if (isAdFree) {
      curatedContentAdFreeAgent.get()(EDITIONS_WITH_CONTAINER(ContainerMeta(theme, edition)))
    } else {
      curatedContentAgent.get()(EDITIONS_WITH_CONTAINER(ContainerMeta(theme, edition)))
    }

  // having this as a public method allows us to use it in tests, to bypass reliance on the ConfigAgent
  def refreshPaths(paths: List[String]): Future[Unit] = {
    val containerIds = CONTAINERS_WITH_EDITION.keys.toList

    val curatedContentAdFreeFuture = getCuratedContent(FullAdFreeType, paths = paths, containerIds = containerIds)
    val curatedContentFuture = getCuratedContent(FullType, paths = paths, containerIds = containerIds)

    val curatedContents = for {
      curatedContentAdFree <- curatedContentAdFreeFuture
      curatedContent <- curatedContentFuture
    } yield (curatedContentAdFree, curatedContent)

    curatedContents
      .map {
        case (curatedContentAdFree, curatedContent) => {
          log.info(s"Successfully populated the curated content cache.")
          curatedContentAdFreeAgent.send(curatedContentAdFree)
          curatedContentAgent.send(curatedContent)
        }
      }
      .recover {
        case (_) => log.error("Failed to refresh curated content cache.")
      }
  }

  def refresh: Future[Unit] = {
    val containerIds = CONTAINERS_WITH_EDITION.keys.toList
    val paths = ConfigAgent.getConfigsUsingCollectionIds(containerIds)

    refreshPaths(paths)
  }
}
