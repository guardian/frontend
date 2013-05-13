package contentapi

import com.gu.openplatform.contentapi.{FutureAsyncApi, Api}
import com.gu.openplatform.contentapi.connection.{Proxy => ContentApiProxy}
import conf.Configuration
import scala.concurrent.Future
import common.{Edition, Logging, GuardianConfiguration}
import play.api.libs.ws.WS

trait QueryDefaults{
  val supportedTypes = "type/gallery|type/article|type/video"

  //NOTE - do NOT add body to this list
  val trailFields = "headline,trail-text,liveBloggingNow,thumbnail,hasStoryPackage,wordcount"

  val references = "pa-football-competition,pa-football-team,witness-assignment"

  val inlineElements = "picture,witness,video"
}

trait ApiQueryDefaults extends QueryDefaults { self: Api[Future] =>

  def item (id: String, edition: Edition): ItemQuery = item(id, edition.id)

  //common fields that we use across most queries.
  def item(id: String, edition: String): ItemQuery = item.itemId(id)
  .edition(edition)
  .showTags("all")
  .showFields(trailFields)
  .showInlineElements(inlineElements)
  .showMedia("all")
  .showReferences(references)
  .showStoryPackage(true)
  .tag(supportedTypes)

  //common fields that we use across most queries.                                    dispatcher.id
  def search(edition: Edition): SearchQuery = search
  .edition(edition.id)
  .showTags("all")
  .showInlineElements(inlineElements)
  .showReferences(references)
  .showFields(trailFields)
  .showMedia("all")
  .tag(supportedTypes)

}

class ContentApiClient(configuration: GuardianConfiguration) extends FutureAsyncApi with ApiQueryDefaults with DelegateHttp
    with Logging {

  import Configuration.contentApi
  override val targetUrl = contentApi.host
  apiKey = Some(contentApi.key)

  override protected def fetch(url: String, parameters: Map[String, String]) = {
    checkQueryIsEditionalized(url, parameters)
    super.fetch(url, parameters + ("user-tier" -> "internal"))
  }

  private def checkQueryIsEditionalized(url: String, parameters: Map[String, Any]) {
    //you cannot editionalize tag queries                                                                                                                                  super.G
    if (!isTagQuery(url) && !parameters.isDefinedAt("edition")) throw new IllegalArgumentException(
      s"You should never, Never, NEVER create a query that does not include the edition. EVER: $url"
    )
  }

  private def isTagQuery(url: String) = url.endsWith("/tags")


}