package services

import app.LifecycleComponent
import common._
import controllers.front.FrontJsonFapiLive
import model.{FullAdFreeType, FullType, OnwardCollection, PressedPageType}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

class CuratedContentAgent(frontJsonFapiLive: FrontJsonFapiLive) extends GuLogging {
  private lazy val curatedContentAgent = Box[Map[String, OnwardCollection]](Map.empty)
  private lazy val curatedContentAddFreeAgent = Box[Map[String, OnwardCollection]](Map.empty)

  private val CONTAINERS_WITH_EDITION: Map[String, Edition] = {
    Map(
      "uk-alpha/news/regular-stories" -> editions.Uk,
      "c5cad9ee-584d-4e85-85cd-bf8ee481b026" -> editions.Us,
      "au-alpha/news/regular-stories" -> editions.Au,
      "10f21d96-18f6-426f-821b-19df55dfb831" -> editions.International,
      "754c-8e8c-fad9-a927" -> editions.Uk,
      "f6dd-d7b1-0e85-4650" -> editions.Us,
      "c45d-318f-896c-3a85" -> editions.Au,
      "d1ad8ec3-5ee2-4673-94c8-cc3f8d261e52" -> editions.International,
      "3ff78b30-52f5-4d30-ace8-c887113cbe0d" -> editions.Uk,
      "98df412d-b0e7-4d9a-98c2-062642823e94" -> editions.Us,
      "au-alpha/contributors/feature-stories" -> editions.Au,
      "ee3386bb-9430-4a6d-8bca-b99d65790f3b" -> editions.International,
      "ae511a89-ef38-4ec9-aab1-3a5ebc96d118" -> editions.Uk,
      "fb59c1f8-72a7-41d5-8365-a4d574809bed" -> editions.Us,
      "22262088-4bce-4290-9810-cb50bbead8db" -> editions.Au,
      "c7154e22-7292-4d93-a14d-22fd4b6b693d" -> editions.International,
      "uk-alpha/features/feature-stories" -> editions.Uk,
      "us-alpha/features/feature-stories" -> editions.Us,
      "13636104-51ce-4264-bb6b-556c80227331" -> editions.Au,
      "7b297ef5-a3f9-45e5-b915-b54951d7f6ec" -> editions.International,
    )
  }

  private def getPressedCollections(pageType: PressedPageType) = {
    val containerIds = CONTAINERS_WITH_EDITION.keys.toList
    Future.sequence(
      ConfigAgent
        .getConfigsUsingCollectionIds(containerIds)
        .map { path =>
          frontJsonFapiLive
            .get(path, pageType)
            .map(_.map { faciaPage =>
              faciaPage.collections.filter { collection => containerIds.contains(collection.id) }
            })
        },
    ) map (_.flatten) map (_.flatten)
  }

  private def getCuratedContent(pageType: PressedPageType) = {
    getPressedCollections(pageType)
      .map { pressedCollections =>
        val onwardCollections = pressedCollections map { pressedCollection =>
          val collectionId = pressedCollection.id
          val edition = CONTAINERS_WITH_EDITION(collectionId)
          val collection = OnwardCollection.getOnwardCollection(pressedCollection, edition)

          collectionId -> collection
        }
        onwardCollections.toMap
      }
  }

  def getCuratedContentAddFree: Map[String, OnwardCollection] = curatedContentAddFreeAgent.get()
  def getCuratedContent: Map[String, OnwardCollection] = curatedContentAgent.get()

  def refresh: Future[Unit] = {
    val curatedContentFuture = getCuratedContent(FullAdFreeType)
    curatedContentFuture.onComplete {
      case Success(s) => log.info(s"Successfully populated the curated content cache.")
      case Failure(t) => log.error(s"Failed to populate the curated content cache $t", t)
    }
    curatedContentFuture map curatedContentAddFreeAgent.send
    getCuratedContent(FullType) map curatedContentAgent.send
  }

}

class CuratedContentAgentLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
    curatedContentAgent: CuratedContentAgent,
) extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("CuratedContentJob")
    }
  }

  override def start(): Unit = {
    jobs.deschedule("CuratedContentJob")
    jobs.schedule("CuratedContentJob", "18 * * * * ?") {
      curatedContentAgent.refresh
    }

    akkaAsync.after1s {
      curatedContentAgent.refresh
    }
  }
}
