package services

import model.Config
import scala.concurrent.Future
import tools.FaciaApi
import play.api.libs.json.{Reads, JsNumber, JsValue, Json}
import play.api.libs.ws.{Response, WS}
import common.{Logging, ExecutionContexts}
import com.ning.http.client.Realm
import conf.Configuration
import play.Play
import common.FaciaToolMetrics.{ContentApiPutFailure, ContentApiPutSuccess}

trait ContentApiWrite extends ExecutionContexts with Logging {

  case class Item(
                   id: String,
                   meta: Option[Map[String, JsValue]]
                   )

  case class ContentApiPut(
                            `type`: String,
                            displayName: Option[String],
                            groups: Seq[String],
                            curated: Seq[Item],
                            backfill: Option[String],
                            lastModified: String,
                            modifiedBy: String
                            )

  implicit val contentApiPutWriteItem = Json.writes[Item]
  implicit val contentApiPutWriteContentApiPut = Json.writes[ContentApiPut]

  lazy val endpoint = Configuration.contentApi.write.endpoint

  def getCollectionUrlForWrite(id: String): Option[String] = endpoint
    .filter(_.startsWith("https://") || Play.isDev)
    .map(_ + s"/collections/${id.replace('/', '-')}")

  def writeToContentapi(config: Config): Future[Response] = {
    (for {
      username      <- Configuration.contentApi.write.username
      password      <- Configuration.contentApi.write.password
      url           <- getCollectionUrlForWrite(config.id)
      contentApiPut <- generateContentApiPut(config)
    } yield
    {
      val response = WS
        .url(url).withAuth(username, password, Realm.AuthScheme.NONE)
        .put(Json.toJson(contentApiPut))

      response.onSuccess{case r =>
        r.status match {
          case 202 => ContentApiPutSuccess.increment()
          case _   => ContentApiPutFailure.increment()
        }
        log.info(s"Successful Put to content api with status ${r.status}: ${r.body}")
      }
      response.onFailure{case e =>
      ContentApiPutFailure.increment()
        log.warn(s"Failure to put to content api with exception ${e.toString}")
      }
      response
    }) getOrElse Future.failed(new Throwable(s"${config.id} does not exist"))
  }

  private def generateContentApiPut(config: Config): Option[ContentApiPut] = {
    FaciaApi.getBlock(config.id) map { block =>

      ContentApiPut(
        config.roleName.getOrElse("Default"),
        config.displayName,
        config.groups,
        block.live.map {t =>
          Item(t.id, t.meta.map(_.map{
            case (id, jsValue) if id == "group" => (id, jsValue.asOpt[BigDecimal].map(JsNumber.apply).getOrElse(jsValue))
            case j  => j
          }))
        },
        config.contentApiQuery.flatMap(_.split('?').headOption.filter(_.nonEmpty)),
        block.lastUpdated,
        block.updatedEmail
      )
    }
  }

}

object ContentApiWrite extends ContentApiWrite
