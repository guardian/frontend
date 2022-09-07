package services

import akka.util.Timeout
import app.LifecycleComponent
import com.gu.facia.api.models.{Front, _}
import com.gu.facia.client.ApiClient
import com.gu.facia.client.models.{ConfigJson, FrontJson}
import com.madgag.scala.collection.decorators.MapDecorator
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

/**
  * ConfigAgent is a cache for Fronts config.
  *
  * It is the metadata overview for all fronts on www.theguardian.com. It
  * describes the fronts on website along with the collections they contain. The
  * data is pulled from a single file in S3 in the CMS Fronts AWS account.
  *
  * Note, it is pre 'pressing', which means that collections do not contain CAPI
  * article data for backfill etc. Instead, only the metadata is stored - e.g.
  * if the backfill is CAPI-driven and, if so, the query to use. Full data can
  * then be retrieved from the (pressed) Fronts API, which again is really a
  * wrapper over an S3 bucket.
  */
object ConfigAgent extends GuLogging {
  implicit lazy val alterTimeout: Timeout = Configuration.faciatool.configBeforePressTimeout.millis
  private lazy val configAgent = Box[Option[ConfigJson]](None)

  def isLoaded(): Boolean = configAgent.get().isDefined

  def getClient(implicit ec: ExecutionContext): ApiClient = FrontsApi.crossAccountClient

  def refresh(implicit ec: ExecutionContext): Future[Unit] = {
    val futureConfig = getClient.config
    futureConfig.onComplete {
      case Success(_) => log.info(s"Successfully got config")
      case Failure(t) => log.error(s"Getting config failed with $t", t)
    }
    futureConfig.map(Option.apply).map(configAgent.send)
  }

  def refreshWith(config: ConfigJson): Future[Option[ConfigJson]] = {
    configAgent.alter(Option(config))
  }

  def refreshAndReturn(implicit ec: ExecutionContext): Future[Option[ConfigJson]] =
    getClient.config
      .flatMap(config => configAgent.alter { _ => Option(config) })
      .fallbackTo {
        log.warn("Falling back to current ConfigAgent contents on refreshAndReturn")
        Future.successful(configAgent.get())
      }

  def getPathIds: List[String] = {
    val config = configAgent.get()
    config.map(_.fronts.keys.toList).getOrElse(Nil)
  }

  def getConfigCollectionMap: Map[String, Seq[String]] = {
    val config = configAgent.get()
    config.map(_.fronts.mapV(_.collections)).getOrElse(Map.empty)
  }

  def getConfigsUsingCollectionId(id: String): Seq[String] = {
    (getConfigCollectionMap collect {
      case (configId, collectionIds) if collectionIds.contains(id) => configId
    }).toSeq
  }

  def getCanonicalIdForFront(frontId: String): Option[String] = {
    val config = configAgent.get()
    val canonicalCollectionMap =
      config
        .map(_.fronts.mapV(front => front.canonical.orElse(front.collections.headOption)))
        .getOrElse(Map.empty)

    canonicalCollectionMap.get(frontId).flatten
  }

  def getConfigForId(id: String): Option[List[CollectionConfigWithId]] = {
    val config = configAgent.get()
    config
      .flatMap(_.fronts.get(id).map(_.collections))
      .map(
        _.flatMap(collectionId =>
          getConfig(collectionId).map(collectionConfig => CollectionConfigWithId(collectionId, collectionConfig)),
        ),
      )
  }

  def getConfig(id: String): Option[CollectionConfig] =
    configAgent.get().flatMap(_.collections.get(id).map(CollectionConfig.make))

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
      navSection = frontOption.flatMap(_.navSection).filter(_.nonEmpty),
      webTitle = frontOption.flatMap(_.webTitle).filter(_.nonEmpty),
      title = frontOption.flatMap(_.title).filter(_.nonEmpty),
      description = frontOption.flatMap(_.description).filter(_.nonEmpty),
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
      commercial = None, // value found in Content API
      priority = frontOption.flatMap(_.priority),
    )
  }

  def isFrontHidden(id: String): Boolean =
    configAgent.get().exists(_.fronts.get(id).flatMap(_.isHidden).exists(identity))

  def isEmailFront(id: String): Boolean =
    getFrontPriorityFromConfig(id).contains(EmailPriority)

  // email fronts are only served if the email-friendly format has been specified in the request
  def shouldServeFront(id: String)(implicit context: ApplicationContext): Boolean =
    getPathIds.contains(id) && (context.isPreview || !isFrontHidden(id))

  def shouldServeEditionalisedFront(edition: Edition, id: String)(implicit context: ApplicationContext): Boolean = {
    shouldServeFront(s"${edition.id.toLowerCase}/$id")
  }

  def editorsPicksForCollection(collectionId: String): Option[Seq[String]] =
    configAgent
      .get()
      .map(
        _.fronts
          .filter { case (_, front) => front.collections.headOption == Option(collectionId) }
          .keys
          .toSeq,
      )
      .filter(_.nonEmpty)
}

class ConfigAgentLifecycle(appLifecycle: ApplicationLifecycle, jobs: JobScheduler, akkaAsync: AkkaAsync)(implicit
    ec: ExecutionContext,
) extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("ConfigAgentJob")
    }
  }

  override def start(): Unit = {
    jobs.deschedule("ConfigAgentJob")
    jobs.schedule("ConfigAgentJob", "18 * * * * ?") {
      ConfigAgent.refresh
    }

    akkaAsync.after1s {
      ConfigAgent.refresh
    }
  }
}
