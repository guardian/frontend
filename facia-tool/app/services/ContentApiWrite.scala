package services

import frontsapi.model.Block
import model.Config
import scala.concurrent.Future
import tools.FaciaApi
import play.api.libs.json.Json
import play.api.libs.ws.{Response, WS}
import common.ExecutionContexts
import com.ning.http.client.Realm
import conf.Configuration
import play.Play

trait ContentApiWrite extends ExecutionContexts {

  case class Item(
                   id: String,
                   headline: Option[String]
                   )

  case class Group(
                    title: String,
                    content: Seq[Item]
                    )

  case class ContentApiPut(
                            `type`: String,
                            title: Option[String],
                            groups: Seq[Group],
                            backfill: String,
                            lastModified: String,
                            modifiedBy: String
                            )

  implicit val contentApiPutWriteItem = Json.writes[Item]
  implicit val contentApiPutWriteGroup = Json.writes[Group]
  implicit val contentApiPutWriteContentApiPut = Json.writes[ContentApiPut]

  lazy val username = Configuration.contentApi.write.username
  lazy val password = Configuration.contentApi.write.password
  lazy val endpoint = Configuration.contentApi.write.endpoint

  def getCollectionUrlForWrite(id: String): Option[String] = endpoint
    .filter(_.startsWith("https://") || Play.isDev)
    .map(_ + s"/collections/${id.replace('/', '-')}")

  def writeToContentapi(config: Config): Future[Response] = {
    (for {
      url           <- getCollectionUrlForWrite(config.id)
      contentApiPut <- generateContentApiPut(config)
    } yield
    {
      val response = WS
        .url(url).withAuth(username, password, Realm.AuthScheme.NONE)
        .put(Json.toJson(contentApiPut))

      //Initial logging out, remove
      response.onSuccess{case r => println(s"Successful Put to content api with status ${r.status}: ${r.body}")}
      response.onFailure{case e => println(s"Failure to put to content api with exception ${e.toString}")}
      response
    }) getOrElse Future.failed(new Throwable(s"${config.id} does not exist"))
  }

  //Just to check to see what is going out, remove
  def prettyPrint(config: Config): String = Json.prettyPrint(Json.toJson(generateContentApiPut(config)))

  private def generateContentApiPut(config: Config): Option[ContentApiPut] = {
    FaciaApi.getBlock(config.id) map { block =>
      val groups = generateGroups(config, block)

      ContentApiPut(
        config.roleName.getOrElse("Default"),
        config.displayName.orElse(Option("Default Title")),
        groups,
        "uk/news",
        block.lastUpdated,
        block.updatedEmail
      )
    }
  }

  private def generateGroups(config: Config, block: Block): Seq[Group] = {
    config.groups.zipWithIndex.map {case (group, index) =>
    val trails = block.live.filter(_.meta.exists(_.get("group").exists(_.asOpt[String].map(_.toInt).exists(_ == index))))
      Group(
        title = group,
        content = trails.map { trail =>
          Item(
            id=trail.id,
            headline=trail.meta.flatMap(_.get("headline").flatMap(_.asOpt[String]))
          )
        }
      )
    //TODO: Reverse until this is merged: https://github.com/guardian/skeleton/pull/32
    }.reverse
  }
}

object ContentApiWrite extends ContentApiWrite
