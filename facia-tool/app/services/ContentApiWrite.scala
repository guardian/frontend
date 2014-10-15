package services

import common.FaciaToolMetrics.{ContentApiPutFailure, ContentApiPutSuccess}
import common.{ExecutionContexts, Logging}
import conf.Configuration
import com.gu.facia.client.models.{CollectionConfig, TrailMetaData, Trail}
import model.Snap
import org.joda.time.DateTime
import play.Play
import play.api.libs.json.{JsNull, JsNumber, JsValue, Json}
import play.api.libs.ws.{WSAuthScheme, WSResponse, WS}
import tools.FaciaApi

import scala.concurrent.Future

trait ContentApiWrite extends ExecutionContexts with Logging {

  //Intentionally blank
  val defaultTitle: String = ""
  val defaultCollectionType: String = "news"
  val defaultEmail: String = "guardian.frontend.fronts@theguardian.com"

  case class Item(
                   id: String,
                   metadata: Option[TrailMetaData]
                   )

  case class ContentApiPut(
                            `type`: String,
                            title: String,
                            groups: Seq[String],
                            editorsPicks: Option[Seq[String]],
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

  def writeToContentapi(id: String, config: CollectionConfig): Future[WSResponse] = {
    import play.api.Play.current
    (for {
      username      <- Configuration.contentApi.write.username
      password      <- Configuration.contentApi.write.password
      url           <- getCollectionUrlForWrite(id)
    } yield
    {
      val contentApiPut = generateContentApiPut(id, config)

      val response = WS
        .url(url).withAuth(username, password, WSAuthScheme.NONE)
        .put(Json.toJson(contentApiPut))

      response.onSuccess{case r =>
        r.status match {
          case 202 => ContentApiPutSuccess.increment()
          case _   => ContentApiPutFailure.increment()
        }
        log.info(s"Successful Put for $id to content api with status ${r.status}: ${r.body}")
      }
      response.onFailure{case e =>
      ContentApiPutFailure.increment()
        log.warn(s"Failure to put $id to content api with exception ${e.toString}")
      }
      response
    }) getOrElse Future.failed(new RuntimeException(s"Missing config properties for Content API write"))
  }

  private def generateContentApiPut(id: String, config: CollectionConfig): ContentApiPut = {
    val maybeBlock = FaciaApi.getBlock(id)

    ContentApiPut(
      config.`type`.getOrElse(defaultCollectionType),
      config.displayName.orElse(maybeBlock.flatMap(_.displayName)).getOrElse(defaultTitle),
      config.groups.getOrElse(Nil),
      ConfigAgent.editorsPicksForCollection(id),
      maybeBlock map { block => generateItems(block.live) } getOrElse Nil,
      config.apiQuery,
      maybeBlock map { _.lastUpdated } getOrElse { DateTime.now.toString },
      maybeBlock map { _.updatedEmail } getOrElse { defaultEmail }
    )
  }

  private def generateItems(items: List[Trail]): List[Item] =
    items.filterNot(t => Snap.isSnap(t.id)).map { trail =>
      Item(trail.id, trail.meta)
    }

  //TODO: These are in transition and will be removed
  def convertFields: PartialFunction[(String, JsValue), (String, JsValue)] = {
    case ("group", jsValue) => ("group", jsValue.asOpt[BigDecimal].map(JsNumber.apply).getOrElse(jsValue))
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
