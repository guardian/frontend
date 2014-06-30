package contentapi

import com.gu.openplatform.contentapi.{FutureAsyncApi, Api}
import scala.concurrent.Future
import common._
import model.{Content, Trail}
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._
import conf.Configuration.contentApi
import com.gu.openplatform.contentapi.model.ItemResponse
import conf.Configuration

trait QueryDefaults extends implicits.Collections with ExecutionContexts {

  //NOTE - do NOT add body to this list
  val trailFields = "headline,trail-text,liveBloggingNow,thumbnail,hasStoryPackage,wordcount,shortUrl,commentable,commentCloseDate,starRating"

  val references = "pa-football-competition,pa-football-team,witness-assignment,esa-cricket-match"

  val inlineElements = "picture,witness,video,embed"

  val leadContentMaxAge = 1.day

  object EditorsPicsOrLeadContentAndLatest {

    def apply(result: Future[ItemResponse]): Future[Seq[Trail]] =
      result.map{ r =>

        val leadContentCutOff = DateTime.now.toDateMidnight - leadContentMaxAge

        var results = r.results.map(Content(_))
        var editorsPicks = r.editorsPicks.map(Content(_))

        val leadContent = if (editorsPicks.isEmpty)
            r.leadContent.filter(_.webPublicationDate >= leadContentCutOff).map(Content(_)).take(1)
          else
            Nil

        (editorsPicks ++ leadContent ++ results).distinctBy(_.id)
      }
  }

  object FaciaDefaults {
    val tag = "tag=type/gallery|type/article|type/video|type/sudoku"
    val editorsPicks = "show-editors-picks=true"
    val showInlineFields = s"show-fields=$trailFields"
    val showFields = "trailText,headline,shortUrl,liveBloggingNow,thumbnail,commentable,commentCloseDate,shouldHideAdverts,lastModified,byline,standfirst,starRating,showInRelatedContent"
    val showFieldsWithBody = showFields + ",body"

    val all = Seq(tag, editorsPicks, showInlineFields, showFields)

    def generateContentApiQuery(id: String): String =
      "%s?&%s"
        .format(id, all.mkString("", "&", ""))
  }
}


trait ApiQueryDefaults extends QueryDefaults with implicits.Collections with Logging {
  self: Api[Future] =>

  def item (id: String, edition: Edition): ItemQuery = item(id, edition.id)

  //common fields that we use across most queries.
  def item(id: String, edition: String): ItemQuery = item.itemId(id)
    .edition(edition)
    .showTags("all")
    .showFields(trailFields)
    .showInlineElements(inlineElements)
    .showElements("all")
    .showReferences(references)
    .showStoryPackage(true)



  //common fields that we use across most queries.
  def search(edition: Edition): SearchQuery = search
    .edition(edition.id)
    .showTags("all")
    .showInlineElements(inlineElements)
    .showReferences(references)
    .showFields(trailFields)
    .showElements("all")
}

trait ContentApiClient extends FutureAsyncApi with ApiQueryDefaults with DelegateHttp
with Logging {

  apiKey = contentApi.key

  override def fetch(url: String, parameters: Map[String, String]) = {
    checkQueryIsEditionalized(url, parameters)
    super.fetch(url, parameters + ("user-tier" -> "internal"))
  }

  private def checkQueryIsEditionalized(url: String, parameters: Map[String, Any]) {
    //you cannot editionalize tag queries
    if (!isTagQuery(url) && !parameters.isDefinedAt("edition")) throw new IllegalArgumentException(
      s"You should never, Never, NEVER create a query that does not include the edition. EVER: $url"
    )
  }

  private def isTagQuery(url: String) = url.endsWith("/tags")
}

class ElasticSearchLiveContentApiClient extends ContentApiClient {
  lazy val httpTimingMetric = ContentApiMetrics.ElasticHttpTimingMetric
  lazy val httpTimeoutMetric = ContentApiMetrics.ElasticHttpTimeoutCountMetric
  override val targetUrl = contentApi.contentApiLiveHost
}
