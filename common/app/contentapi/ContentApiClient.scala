package contentapi

import com.gu.openplatform.contentapi.{FutureAsyncApi, Api}
import com.gu.openplatform.contentapi.connection.{Proxy => ContentApiProxy}
import conf.Configuration
import scala.concurrent.Future
import common.{ExecutionContexts, Edition, Logging, GuardianConfiguration}
import com.gu.openplatform.contentapi.model.ItemResponse
import model.{Content, Trail}
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._

trait QueryDefaults extends implicits.Collections with ExecutionContexts {
  val supportedTypes = "type/gallery|type/article|type/video|type/sudoku"

  //NOTE - do NOT add body to this list
  val trailFields = "headline,trail-text,liveBloggingNow,thumbnail,hasStoryPackage,wordcount,shortUrl"

  val references = "pa-football-competition,pa-football-team,witness-assignment,esa-cricket-match"

  val inlineElements = "picture,witness,video,embed"

  val leadContentMaxAge = 2.days

  object EditorsPicsOrLeadContentAndLatest {

    def apply(result: Future[ItemResponse]): Future[Seq[Trail]] =
      result.map{ r =>

        val leadContentCutOff = DateTime.now.toDateMidnight - leadContentMaxAge

        var results = r.results.map(new Content(_))
        var editorsPicks = r.editorsPicks.map(new Content(_))

        val leadContent = if (editorsPicks.isEmpty)
            r.leadContent.filter(_.webPublicationDate >= leadContentCutOff).map(new Content(_)).take(1)
          else
            Nil

        (editorsPicks ++ leadContent ++ results).distinctBy(_.id)
      }
  }
}

trait ApiQueryDefaults extends QueryDefaults with implicits.Collections { self: Api[Future] =>

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

  //common fields that we use across most queries.
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

  override def fetch(url: String, parameters: Map[String, String]) = {
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
