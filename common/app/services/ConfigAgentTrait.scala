package services

import akka.util.Timeout
import com.gu.facia.api.models.CollectionConfig
import com.gu.facia.client.models.{ConfigJson => Config, FrontJson => Front}
import common._
import conf.Configuration
import fronts.FrontsApi
import model.{FrontProperties, SeoDataJson}
import play.api.libs.json.Json
import play.api.{Application, GlobalSettings}

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.{Failure, Success}

case class CollectionConfigWithId(id: String, config: CollectionConfig)

trait ConfigAgentTrait extends ExecutionContexts with Logging {
  implicit val alterTimeout: Timeout = Configuration.faciatool.configBeforePressTimeout.millis
  private lazy val configAgent = AkkaAgent[Option[Config]](None)

  def refresh() = {
    val futureConfig = FrontsApi.amazonClient.config
    futureConfig.onComplete {
      case Success(config) => log.info(s"Successfully got config")
      case Failure(t) => log.error(s"Getting config failed with $t", t)
    }
    futureConfig.map(Option.apply).map(configAgent.send)
  }

  def refreshWith(config: Config): Unit = {
    configAgent.send(Option(config))
  }

  def refreshAndReturn(): Future[Option[Config]] =
    FrontsApi.amazonClient.config
      .flatMap(config => configAgent.alter{_ => Option(config)})
      .fallbackTo{
      log.warn("Falling back to current ConfigAgent contents on refreshAndReturn")
      Future.successful(configAgent.get())
    }

  def getPriorityForPath(path: String): Option[String] = {
    val config = configAgent.get()
    config.flatMap(_.fronts.get(path).flatMap(_.priority))
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

  def getConfig(id: String): Option[CollectionConfig] = configAgent.get().flatMap(_.collections.get(id).map(CollectionConfig.fromCollectionJson))

  def getConfigAfterUpdates(id: String): Future[Option[CollectionConfig]] =
    configAgent.future()
      .map(_.flatMap(_.collections.get(id)).map(CollectionConfig.fromCollectionJson))

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

  def fetchFrontProperties(id: String): FrontProperties = {
    val frontOption: Option[Front] = configAgent.get().flatMap(_.fronts.get(id))

    FrontProperties(
      onPageDescription = frontOption.flatMap(_.onPageDescription),
      imageUrl = frontOption.flatMap(_.imageUrl),
      imageWidth = frontOption.flatMap(_.imageWidth).map(_.toString),
      imageHeight = frontOption.flatMap(_.imageHeight).map(_.toString),
      isImageDisplayed = frontOption.flatMap(_.isImageDisplayed).getOrElse(false),
      editorialType = None // value found in Content API
    )
  }

  def isFrontHidden(id: String): Boolean =
    configAgent.get().exists(_.fronts.get(id).flatMap(_.isHidden).exists(identity))

  def shouldServeFront(id: String) = getPathIds.contains(id) &&
    (Configuration.environment.isPreview || !isFrontHidden(id))

  def shouldServeEditionalisedFront(edition: Edition, id: String) = {
    shouldServeFront(s"${edition.id.toLowerCase}/$id")
  }

  def editorsPicksForCollection(collectionId: String): Option[Seq[String]] =
    configAgent.get()
      .map(_.fronts
        .filter{ case (path, front) => front.collections.headOption == Option(collectionId)}
        .keys.toSeq).filter(_.nonEmpty)
}

object ConfigAgent extends ConfigAgentTrait

trait ConfigAgentLifecycle extends GlobalSettings {

  override def onStart(app: Application) {
    super.onStart(app)

    Jobs.deschedule("ConfigAgentJob")
    Jobs.schedule("ConfigAgentJob", "18 * * * * ?") {
      ConfigAgent.refresh()
    }

    AkkaAsync {
      ConfigAgent.refresh()
    }
  }

  override def onStop(app: Application) {
    Jobs.deschedule("ConfigAgentJob")
    super.onStop(app)
  }
}
