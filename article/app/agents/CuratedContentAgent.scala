package agents

import com.gu.contentapi.client.utils.format.{CulturePillar, LifestylePillar, NewsPillar, OpinionPillar, SportPillar, Theme}
import common._
import common.editions.{Au, International, Uk, Us}
import model.dotcomrendering.Trail
import model.pressed.PressedContent
import model.{FullAdFreeType, FullType, PressedPageType}
import services.ConfigAgent
import services.fronts.FrontJsonFapiLive

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class CuratedContentAgent(frontJsonFapiLive: FrontJsonFapiLive) extends GuLogging {
  private lazy val curatedContentAgent = Box[Map[String, Seq[PressedContent]]](Map.empty)
  private lazy val curatedContentAdFreeAgent = Box[Map[String, Seq[PressedContent]]](Map.empty)

  private val containerIds: Seq[String] =
    Seq(NewsPillar, SportPillar, OpinionPillar, CulturePillar, LifestylePillar) flatMap { theme =>
      Seq(
        getContainerId(theme, Uk),
        getContainerId(theme, Us),
        getContainerId(theme, Au),
        getContainerId(theme, International),
      )
    }

  private def getContainerId(theme: Theme, edition: Edition) =
    theme match {
      case NewsPillar =>
        edition match {
          case Uk => "uk-alpha/news/regular-stories"
          case Us => "c5cad9ee-584d-4e85-85cd-bf8ee481b026"
          case Au => "au-alpha/news/regular-stories"
          case International => "10f21d96-18f6-426f-821b-19df55dfb831"
        }
      case SportPillar =>
        edition match {
          case Uk => "754c-8e8c-fad9-a927"
          case Us => "f6dd-d7b1-0e85-4650"
          case Au => "c45d-318f-896c-3a85"
          case International => "d1ad8ec3-5ee2-4673-94c8-cc3f8d261e52"
        }
      case OpinionPillar =>
        edition match {
          case Uk => "3ff78b30-52f5-4d30-ace8-c887113cbe0d"
          case Us => "98df412d-b0e7-4d9a-98c2-062642823e94"
          case Au => "au-alpha/contributors/feature-stories"
          case International => "ee3386bb-9430-4a6d-8bca-b99d65790f3b"
        }
      case CulturePillar =>
        edition match {
          case Uk => "ae511a89-ef38-4ec9-aab1-3a5ebc96d118"
          case Us => "fb59c1f8-72a7-41d5-8365-a4d574809bed"
          case Au => "22262088-4bce-4290-9810-cb50bbead8db"
          case International => "c7154e22-7292-4d93-a14d-22fd4b6b693d"
        }
      case LifestylePillar =>
        edition match {
          case Uk => "uk-alpha/features/feature-stories"
          case Us => "us-alpha/features/feature-stories"
          case Au => "13636104-51ce-4264-bb6b-556c80227331"
          case International => "7b297ef5-a3f9-45e5-b915-b54951d7f6ec"
        }
      // This is the same as NewsPillar
      case _ =>
        edition match {
          case Uk => "uk-alpha/news/regular-stories"
          case Us => "c5cad9ee-584d-4e85-85cd-bf8ee481b026"
          case Au => "au-alpha/news/regular-stories"
          case International => "10f21d96-18f6-426f-821b-19df55dfb831"
        }
    }

  private def getPressedCollections(pageType: PressedPageType, paths: List[String], containerIds: Seq[String]) = {

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

  private def getCuratedContent(pageType: PressedPageType, paths: List[String], containerIds: Seq[String]) = {
    getPressedCollections(pageType, paths, containerIds)
      .map { pressedCollections =>
        val onwardCollections = pressedCollections.map { pressedCollection =>
          val collectionId = pressedCollection.id
          val trails = pressedCollection.curatedPlusBackfillDeduplicated
            .take(10)

          collectionId -> trails
        }
        onwardCollections.toMap
      }
  }

  def getCuratedContentAdFree: Map[String, Seq[PressedContent]] = curatedContentAdFreeAgent.get()

  def getCuratedContent: Map[String, Seq[PressedContent]] = curatedContentAgent.get()

  def getTrails(theme: Theme, edition: Edition, isAdFree: Boolean): Seq[Trail] = {
    if (isAdFree) {
      curatedContentAdFreeAgent.get()(getContainerId(theme, edition))
    } else {
      curatedContentAgent.get()(getContainerId(theme, edition))
    }
  }.map(pressed => Trail.pressedContentToTrail(pressed, edition))


  // having this as a public method allows us to use it in tests, to bypass reliance on the ConfigAgent
  def refreshPaths(paths: List[String]): Future[Unit] = {
    val curatedContentAdFreeFuture = getCuratedContent(FullAdFreeType, paths, containerIds)
    val curatedContentFuture = getCuratedContent(FullType, paths, containerIds)

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
    val paths = ConfigAgent.getConfigsUsingCollectionIds(containerIds)

    refreshPaths(paths)
  }
}
