package services

import frontsapi.model.Trail
import model.Config
import scala.concurrent.Future
import tools.FaciaApi
import play.api.libs.json.{JsNull, JsNumber, JsValue, Json}
import play.api.libs.ws.{Response, WS}
import common.{Logging, ExecutionContexts}
import com.ning.http.client.Realm
import conf.Configuration
import play.Play
import common.FaciaToolMetrics.{ContentApiPutFailure, ContentApiPutSuccess}
import org.joda.time.DateTime

trait ContentApiWrite extends ExecutionContexts with Logging {

  //Intentionally blank
  val defaultTitle: String = ""
  val defaultCollectionType: String = "news"
  val defaultEmail: String = "guardian.frontend.fronts@theguardian.com"

  case class Item(
                   id: String,
                   metadata: Option[Map[String, JsValue]]
                   )

  case class ContentApiPut(
                            `type`: String,
                            title: String,
                            groups: Seq[String],
                            curatedContent: Seq[Item],
                            backfill: Option[String],
                            lastModified: String,
                            modifiedBy: String
                            )

  implicit val contentApiPutWriteItem = Json.writes[Item]
  implicit val contentApiPutWriteContentApiPut = Json.writes[ContentApiPut]

  lazy val endpoint = Configuration.contentApi.write.endpoint

  def getCollectionUrlForWrite(id: String): Option[String] = endpoint
    .filter(_.startsWith("https://") || Play.isDev)
    .map(_ + s"/collections/$id")

  def writeToContentapi(config: Config): Future[Response] = {
    (for {
      username      <- Configuration.contentApi.write.username
      password      <- Configuration.contentApi.write.password
      url           <- getCollectionUrlForWrite(config.id)
    } yield
    {
      val contentApiPut = generateContentApiPut(config)

      val response = WS
        .url(url).withAuth(username, password, Realm.AuthScheme.NONE)
        .put(Json.toJson(contentApiPut))

      response.onSuccess{case r =>
        r.status match {
          case 202 => ContentApiPutSuccess.increment()
          case _   => ContentApiPutFailure.increment()
        }
        log.info(s"Successful Put for ${config.id} to content api with status ${r.status}: ${r.body}")
      }
      response.onFailure{case e =>
      ContentApiPutFailure.increment()
        log.warn(s"Failure to put ${config.id} to content api with exception ${e.toString}")
      }
      response
    }) getOrElse Future.failed(new RuntimeException(s"Missing config properties for Content API write"))
  }

  private def generateContentApiPut(config: Config): ContentApiPut = {
    val maybeBlock = FaciaApi.getBlock(config.id)

    ContentApiPut(
      config.collectionType.getOrElse(defaultCollectionType),
      config.displayName.orElse(maybeBlock.flatMap(_.displayName)).getOrElse(defaultTitle),
      config.groups,
      maybeBlock map { block => generateItems(block.live) } getOrElse Nil,
      config.contentApiQuery,
      maybeBlock map { _.lastUpdated } getOrElse { DateTime.now.toString },
      maybeBlock map { _.updatedEmail } getOrElse { defaultEmail }
    )
  }

  private def generateItems(items: List[Trail]): List[Item] =
    items.map { trail =>
    Item(trail.id, trail.meta.map(_.map(convertFields))
    )
    }

  //TODO: These are in transition and will be removed
  def convertFields: PartialFunction[(String, JsValue), (String, JsValue)] = {
    case ("group", jsValue) => ("group", jsValue.asOpt[BigDecimal].map(JsNumber.apply).getOrElse(jsValue))
    case ("imageAdjust", jsValue) => ("imageAdjustment", jsValue)
    case ("meta", jsValue)        => ("metadata", convertMeta(jsValue))
    case ("supporting", jsValue)  => ("supportingContent", convertSupporting(jsValue))
    case j  => j
  }

  def convertSupporting(meta: JsValue): JsValue =
    meta.asOpt[List[JsValue]].map(_.map(convertMeta)).map(Json.toJson(_)).getOrElse(JsNull)

  def convertMeta(meta: JsValue): JsValue =
    meta.asOpt[Map[String, JsValue]].map(_.map(convertFields)).map(Json.toJson(_)).getOrElse(JsNull)

}

object ContentApiWrite extends ContentApiWrite
