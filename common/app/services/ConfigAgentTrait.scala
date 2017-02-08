package services

import akka.util.Timeout
import app.LifecycleComponent
import com.gu.facia.api.models.{Front, _}
import com.gu.facia.client.ApiClient
import com.gu.facia.client.models.{ConfigJson, FrontJson}
import common._
import conf.Configuration
import fronts.FrontsApi
import model.pressed.CollectionConfig
import model.{ApplicationContext, FrontProperties, SeoDataJson}
import play.api.inject.ApplicationLifecycle
import play.api.libs.json.Json

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

case class CollectionConfigWithId(id: String, config: CollectionConfig)

trait ConfigAgentTrait extends ExecutionContexts with Logging {
  implicit lazy val alterTimeout: Timeout = Configuration.faciatool.configBeforePressTimeout.millis
  private lazy val configAgent = AkkaAgent[Option[ConfigJson]](None)

  def isLoaded() = configAgent.get().isDefined

  def getClient: ApiClient = {
    FrontsApi.crossAccountClient
  }

  def refresh() = {
    val futureConfig = getClient.config
    futureConfig.onComplete {
      case Success(config) => log.info(s"Successfully got config")
      case Failure(t) => log.error(s"Getting config failed with $t", t)
    }
    futureConfig.map(Option.apply).map(configAgent.send)
  }

  def refreshWith(config: ConfigJson): Unit = {
    configAgent.send(Option(config))
  }

  def refreshAndReturn(): Future[Option[ConfigJson]] =
    getClient.config
      .flatMap(config => configAgent.alter{_ => Option(config)})
      .fallbackTo{
      log.warn("Falling back to current ConfigAgent contents on refreshAndReturn")
      Future.successful(configAgent.get())
    }

  def getPathIds: List[String] = {
    val config = configAgent.get()
    config.map(_.fronts.keys.toList).getOrElse(Nil)
  }

  def getConfigCollectionMap: Map[String, Seq[String]] = {
    val config = configAgent.get()
    config.map(_.fronts.mapValues(_.collections)).getOrElse(Map.empty)
  }

  def getConfigsUsingCollectionId(id: String): Seq[String] = {
    (getConfigCollectionMap collect {
      case (configId, collectionIds) if collectionIds.contains(id) => configId
    }).toSeq
  }

  def getCanonicalIdForFront(frontId: String): Option[String] = {
    val config = configAgent.get()
    val canonicalCollectionMap = config.map (_.fronts.mapValues(front => front.canonical.orElse(front.collections.headOption))).getOrElse(Map.empty)

    canonicalCollectionMap.get(frontId).flatten
  }

  def getConfigForId(id: String): Option[List[CollectionConfigWithId]] = {
    val config = configAgent.get()
    config.flatMap(_.fronts.get(id).map(_.collections))
      .map(_.flatMap(collectionId => getConfig(collectionId).map(collectionConfig => CollectionConfigWithId(collectionId, collectionConfig))))
  }

  def getConfig(id: String): Option[CollectionConfig] = configAgent.get().flatMap(_.collections.get(id).map(CollectionConfig.make))

  def getConfigAfterUpdates(id: String): Future[Option[CollectionConfig]] =
    configAgent.future()
      .map(_.flatMap(_.collections.get(id)).map(CollectionConfig.make))

  def getAllCollectionIds: List[String] = {
    val config = configAgent.get()
    config.map(_.collections.keys.toList).getOrElse(Nil)
  }

  def contentsAsJsonString: String = Json.prettyPrint(Json.toJson(configAgent.get()))

  def getSeoDataJsonFromConfig(path: String): SeoDataJson = {
    val config = configAgent.get()

    val frontOption = config.flatMap(_.fronts.get(path))
    SeoDataJson(
      path,
      navSection   = frontOption.flatMap(_.navSection).filter(_.nonEmpty),
      webTitle  = frontOption.flatMap(_.webTitle).filter(_.nonEmpty),
      title  = frontOption.flatMap(_.title).filter(_.nonEmpty),
      description  = frontOption.flatMap(_.description).filter(_.nonEmpty)
    )
  }

  def getFrontPriorityFromConfig(pageId: String): Option[FrontPriority] = {
    configAgent.get() flatMap {
      _.fronts.get(pageId) map { frontJson =>
        Front.fromFrontJson(pageId, frontJson).priority
      }
    }
  }

  def fetchFrontProperties(id: String): FrontProperties = {
    val frontOption: Option[FrontJson] = configAgent.get().flatMap(_.fronts.get(id))

    FrontProperties(
      onPageDescription = frontOption.flatMap(_.onPageDescription),
      imageUrl = frontOption.flatMap(_.imageUrl),
      imageWidth = frontOption.flatMap(_.imageWidth).map(_.toString),
      imageHeight = frontOption.flatMap(_.imageHeight).map(_.toString),
      isImageDisplayed = frontOption.flatMap(_.isImageDisplayed).getOrElse(false),
      editorialType = None, // value found in Content API
      editionBrandings = None // value found in Content API
    )
  }

  def isFrontHidden(id: String): Boolean =
    configAgent.get().exists(_.fronts.get(id).flatMap(_.isHidden).exists(identity))

  def isEmailFront(id: String): Boolean =
    getFrontPriorityFromConfig(id).contains(EmailPriority)

  // email fronts are only served if the email-friendly format has been specified in the request
  def shouldServeFront(id: String)(implicit context: ApplicationContext) =
    getPathIds.contains(id) && (context.isPreview || !isFrontHidden(id))

  def shouldServeEditionalisedFront(edition: Edition, id: String)(implicit context: ApplicationContext) = {
    shouldServeFront(s"${edition.id.toLowerCase}/$id")
  }

  def editorsPicksForCollection(collectionId: String): Option[Seq[String]] =
    configAgent.get()
      .map(_.fronts
        .filter{ case (path, front) => front.collections.headOption == Option(collectionId)}
        .keys.toSeq).filter(_.nonEmpty)
}

object ConfigAgent extends ConfigAgentTrait

class ConfigAgentLifecycle(
  appLifecycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync)
  (implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifecycle.addStopHook { () => Future {
    jobs.deschedule("ConfigAgentJob")
  }}

  override def start() = {
    jobs.deschedule("ConfigAgentJob")
    jobs.schedule("ConfigAgentJob", "18 * * * * ?") {
      ConfigAgent.refresh()
    }

    akkaAsync.after1s {
      ConfigAgent.refresh()
    }
  }
}

