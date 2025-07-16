package services

import com.github.nscala_time.time.Implicits._
import com.gu.contentapi.client.model.ContentApiError
import com.gu.contentapi.client.model.v1.{ItemResponse, SearchResponse, Section => ApiSection}
import common._
import contentapi.{ContentApiClient, QueryDefaults, SectionTagLookUp, SectionsLookUp}
import model._
import org.joda.time.DateTime
import play.api.mvc.{RequestHeader, Result => PlayResult}

import scala.concurrent.Future

trait Index extends ConciergeRepository {

  implicit val context: ApplicationContext

  val contentApiClient: ContentApiClient
  val sectionsLookUp: SectionsLookUp
  private val rssFields = s"${QueryDefaults.trailFields},byline,standfirst"

  def normaliseTag(tag: String): String = {
    val conversions: Map[String, String] =
      Map("content" -> "type")

    val convertedTag = conversions.foldLeft(tag) { case (newTag, (from, to)) =>
      if (newTag.startsWith(s"$from/"))
        newTag.replace(from, to)
      else
        newTag
    }

    convertedTag match {
      // under the hoods some uk-news/... tags are actually uk/... Fixes loads of Googlebot 404s
      // this just is an or statement e.g. uk-news/foo OR uk/foo
      case UkNewsSection(lastPart) => s"($convertedTag|uk/$lastPart)"
      case other                   => other
    }

  }

  def index(leftSide: String, rightSide: String, page: Int, isRss: Boolean)(implicit
      request: RequestHeader,
  ): Future[Either[PlayResult, IndexPage]] = {

    val section = leftSide.split('/').head

    // if the first tag is just one part then change it to a section tag...
    val firstTag = normaliseTag(
      leftSide match {
        case SinglePart(wordsForUrl) => s"$wordsForUrl/$wordsForUrl"
        case other                   => other
      },
    )

    // if the second tag is just one part then it is in the same section as the first tag...
    val secondTag = normaliseTag(
      rightSide match {
        case SinglePart(wordsForUrl)     => s"$section/$wordsForUrl"
        case SeriesInSameSection(series) => s"$section/$series"
        case other                       => other
      },
    )

    val promiseOfResponse = contentApiClient
      .getResponse(
        contentApiClient
          .search()
          .tag(s"$firstTag,$secondTag")
          .page(page)
          .pageSize(IndexPagePagination.pageSize)
          .showFields(if (isRss) rssFields else QueryDefaults.trailFieldsWithMain),
      )
      .map { response =>
        val trails = response.results.map(IndexPageItem(_)).toList
        trails match {
          case Nil => Left(NotFound)
          case head :: _ =>
            val tag1 = findTag(head.item, firstTag)
            val tag2 = findTag(head.item, secondTag)
            if (tag1.isDefined && tag2.isDefined) {
              val page = TagCombiner(s"$leftSide+$rightSide", tag1.get, tag2.get, pagination(response))
              Right(
                IndexPage(
                  page,
                  contents = trails,
                  tags = Tags(List(tag1.get, tag2.get)),
                  date = DateTime.now,
                  tzOverride = None,
                ),
              )
            } else {
              Left(NotFound)
            }
        }
      }

    promiseOfResponse
      .recover({
        // this is the best handle we have on a wrong 'page' number
        case ContentApiError(400, _, _) => Left(Found(s"/$leftSide+$rightSide"))
      })
      .recover(convertApiExceptions)

  }

  private def findTag(trail: ContentType, tagId: String) =
    trail.content.tags.tags
      .filter(tag => tagId.contains(tag.id))
      .sortBy(tag => tagId.replace(tag.id, "")) // effectively sorts by best match
      .headOption

  private def pagination(response: ItemResponse) =
    Some(
      Pagination(
        response.currentPage.getOrElse(1),
        response.pages.getOrElse(1),
        response.total.getOrElse(0),
      ),
    )

  private def pagination(response: SearchResponse) =
    Some(
      Pagination(
        response.currentPage,
        response.pages,
        response.total,
      ),
    )

  def index(edition: Edition, path: String, pageNum: Int, isRss: Boolean)(implicit
      request: RequestHeader,
  ): Future[Either[PlayResult, IndexPage]] = {

    val fields = if (isRss) rssFields else QueryDefaults.trailFieldsWithMain
    val blocks = if (isRss) Some(TrailsToRss.BlocksToGenerateRssIntro) else None

    val maybeSection = sectionsLookUp.get(path)

    /** If looking up a section, go to equivalent tag instead.
      *
      * As items can only have one section, but can have multiple section tags, this is how we get content of what are
      * essentially 'subsections' in the nav. e.g., if you looked up 'culture' as a section, you would only get the
      * items that directly belong to that section, which would exclude items in the 'books' section. If you look up the
      * 'culture/culture' tag, however, you'll get all of the things in 'culture', but also all of the things in
      * 'books', as everything in 'books' is also tagged 'culture/culture'.
      */
    val queryPath = maybeSection.fold(path)(s => SectionTagLookUp.tagId(s.id))

    // Old version
    // val pageSize = IndexPagePagination.pageSize

    /*
       Current version [ March/April 20202 ] (Pascal)

       During coronavirus news cycles some profiles had such a particular tag page
       that the corresponding CAPI query used to make the RSS page was timing out.
       I made this modification to handle one such profile "profile/helenasmith"
       by reducing the page size.

       If another profiles causes problem then just add it to the list.
       This solution is efficient and avoid the arguably un-necessary pain of refactoring RSS.
       This solution can be re-evaluated later
     */
    val exceptionalProfilePathsForRss = List("profile/helenasmith")
    val isExceptionalProfileForRss = exceptionalProfilePathsForRss.contains(path)
    val reducedPageSize = 5 // Determined through trial and error.
    val pageSize = if (isRss && isExceptionalProfileForRss) reducedPageSize else IndexPagePagination.pageSize

    val itemQuery = contentApiClient
      .item(queryPath, edition)
      .page(pageNum)
      .pageSize(pageSize)
      .showFields(fields)
      .showBlocks(blocks)
    val withBlocks = blocks.map(itemQuery.showBlocks(_)).getOrElse(itemQuery)

    val promiseOfResponse = contentApiClient.getResponse(withBlocks) map { response =>
      val page = maybeSection.map(s => section(s, response)) orElse
        response.tag.flatMap(_ => tag(response, pageNum)) orElse
        response.section.map(s => section(s, response))
      ModelOrResult(page, response, maybeSection)
    }

    promiseOfResponse
      .recover({
        // this is the best handle we have on a wrong 'page' number
        case ContentApiError(400, _, _) if pageNum != 1 => Left(Found(s"/$path"))
      })
      .recover(convertApiExceptions)
  }

  private def section(apiSection: ApiSection, response: ItemResponse) = {
    val section = Section.make(apiSection, pagination(response))
    val editorsPicks = response.editorsPicks.getOrElse(Nil)
    val editorsPicksIds = editorsPicks.map(_.id)
    val latestContent = response.results.getOrElse(Nil).filterNot(c => editorsPicksIds contains c.id)
    val trails = (editorsPicks ++ latestContent).map(IndexPageItem(_))
    val commercial = Commercial.empty
    IndexPage(
      page = section,
      contents = trails.toSeq,
      tags = Tags(Nil),
      date = DateTime.now,
      tzOverride = None,
      commercial = commercial,
    )
  }

  private def tag(response: ItemResponse, page: Int): Option[IndexPage] = {
    val tag = response.tag map { Tag.make(_, pagination(response)) }
    val leadContentCutOff = DateTime.now - QueryDefaults.leadContentMaxAge
    val editorsPicks = response.editorsPicks.getOrElse(Nil).map(IndexPageItem(_))
    val leadContent =
      if (editorsPicks.isEmpty && page == 1) // only promote lead content on first page
        response.leadContent
          .getOrElse(Nil)
          .take(1)
          .map(IndexPageItem(_))
          .filter(_.item.trail.webPublicationDate > leadContentCutOff)
      else
        Nil
    val leadContentIds = leadContent.map(_.item.metadata.id)

    val latest: Seq[IndexPageItem] =
      response.results
        .getOrElse(Nil)
        .map(IndexPageItem(_))
        .toSeq
        .filterNot(c => leadContentIds.contains(c.item.metadata.id))
    val allTrails = (leadContent ++ editorsPicks ++ latest).distinctBy(_.item.metadata.id)

    tag map { tag =>
      IndexPage(page = tag, contents = allTrails.toSeq, tags = Tags(List(tag)), date = DateTime.now, tzOverride = None)
    }
  }

  // for some reason and for the life of me I cannot figure it out, this does not compile if these
  // are at the top of the file :(
  val SinglePart = """([\w\d\.-]+)""".r
  val SeriesInSameSection = """(series/[\w\d\.-]+)""".r
  val UkNewsSection = """^uk-news/(.+)$""".r
}
