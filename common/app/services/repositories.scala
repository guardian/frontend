package services

import com.gu.contentapi.client.GuardianContentApiError
import com.gu.contentapi.client.model.{ItemResponse, SearchResponse, Section => ApiSection}
import common._
import conf.LiveContentApi
import conf.LiveContentApi.getResponse
import contentapi.{QueryDefaults, SectionTagLookUp, SectionsLookUp}
import model._
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._
import play.api.mvc.{RequestHeader, Result => PlayResult}

import scala.concurrent.Future

trait Index extends ConciergeRepository with QueryDefaults {

  private val rssFields = s"$trailFields,byline,body,standfirst"

  def normaliseTag(tag: String): String = {
    val conversions: Map[String, String] =
      Map("content" -> "type")

    val convertedTag = conversions.foldLeft(tag){
      case (newTag, (from, to)) =>
        if (newTag.startsWith(s"$from/"))
          newTag.replace(from, to)
        else
          newTag
    }

    convertedTag match {
      // under the hoods some uk-news/... tags are actually uk/... Fixes loads of Googlebot 404s
      // this just is an or statement e.g. uk-news/foo OR uk/foo
      case UkNewsSection(lastPart) => s"($convertedTag|uk/$lastPart)"
      case other => other
    }

  }

  def index(edition: Edition, leftSide: String, rightSide: String, page: Int, isRss: Boolean)
           (implicit request: RequestHeader): Future[Either[IndexPage, PlayResult]] = {

    val section = leftSide.split('/').head

    // if the first tag is just one part then change it to a section tag...
    val firstTag = normaliseTag(
      leftSide match {
        case SinglePart(wordsForUrl) => s"$wordsForUrl/$wordsForUrl"
        case other => other
      }
    )

    // if the second tag is just one part then it is in the same section as the first tag...
    val secondTag = normaliseTag(
      rightSide match {
        case SinglePart(wordsForUrl) => s"$section/$wordsForUrl"
        case SeriesInSameSection(series) => s"$section/$series"
        case other => other
      }
    )

    val promiseOfResponse = getResponse(LiveContentApi.search(edition)
      .tag(s"$firstTag,$secondTag")
      .page(page)
      .pageSize(if (isRss) IndexPagePagination.rssPageSize else IndexPagePagination.pageSize)
      .showFields(if (isRss) rssFields else trailFields)
    ).map {response =>
      val trails = response.results.map(IndexPageItem(_))
      trails match {
        case Nil => Right(NotFound)
        case head :: _ =>
          //we can use .head here as the query is guaranteed to return the 2 tags
          val tag1 = findTag(head.item, firstTag)
          val tag2 = findTag(head.item, secondTag)

          val page = new TagCombiner(s"$leftSide+$rightSide", tag1, tag2, pagination(response))

          Left(IndexPage(page, trails))
      }
    }

    promiseOfResponse.recover({
      //this is the best handle we have on a wrong 'page' number
      case GuardianContentApiError(400, _, _) => Right(Found(s"/$leftSide+$rightSide"))
    }).recover(convertApiExceptions)

  }

  private def findTag(trail: ContentType, tagId: String) = trail.content.tags.tags.filter(tag =>
    tagId.contains(tag.id))
    .sortBy(tag => tagId.replace(tag.id, "")) //effectively sorts by best match
    .head


  private def pagination(response: ItemResponse) = Some(Pagination(
    response.currentPage.getOrElse(1),
    response.pages.getOrElse(1),
    response.total.getOrElse(0)
  ))

  private def pagination(response: SearchResponse) = Some(Pagination(
    response.currentPage,
    response.pages,
    response.total
  ))

  def index(edition: Edition, path: String, pageNum: Int, isRss: Boolean)(implicit request: RequestHeader): Future[Either[IndexPage, PlayResult]] = {
    val pageSize = if (isRss) IndexPagePagination.rssPageSize else IndexPagePagination.pageSize
    val fields = if (isRss) rssFields else trailFields

    val maybeSection = SectionsLookUp.get(path)

    /** If looking up a section, go to equivalent tag instead.
      *
      * As items can only have one section, but can have multiple section tags, this is how we get content of what are
      * essentially 'subsections' in the nav. e.g., if you looked up 'culture' as a section, you would only get the
      * items that directly belong to that section, which would exclude items in the 'books' section. If you look up
      * the 'culture/culture' tag, however, you'll get all of the things in 'culture', but also all of the things in
      * 'books', as everything in 'books' is also tagged 'culture/culture'.
      */
    val queryPath = maybeSection.fold(path)(s => SectionTagLookUp.tagId(s.id))

    val promiseOfResponse = getResponse(LiveContentApi.item(queryPath, edition).page(pageNum)
      .pageSize(pageSize)
      .showFields(fields)
    ) map { response =>
      val page = maybeSection.map(s => section(s, response)) orElse
        response.tag.flatMap(t => tag(response, pageNum)) orElse
        response.section.map(s => section(s, response))

      ModelOrResult(page, response, maybeSection)
    }

    promiseOfResponse.recover({
      //this is the best handle we have on a wrong 'page' number
      case GuardianContentApiError(400, _, _) if pageNum != 1 => Right(Found(s"/$path"))
    }).recover(convertApiExceptions)
  }

  private def section(apiSection: ApiSection, response: ItemResponse) = {
    val section = Section.make(apiSection, pagination(response))
    val editorsPicks = response.editorsPicks
    val editorsPicksIds = editorsPicks.map(_.id)
    val latestContent = response.results.filterNot(c => editorsPicksIds contains c.id)
    val trails = (editorsPicks ++ latestContent).map(IndexPageItem(_))

    IndexPage(section, trails)
  }

  private def tag(response: ItemResponse, page: Int) = {
    val tag = response.tag map { Tag.make(_, pagination(response)) }
    val leadContentCutOff = DateTime.now - leadContentMaxAge
    val editorsPicks = response.editorsPicks.map(IndexPageItem(_))
    val leadContent = if (editorsPicks.isEmpty && page == 1) //only promote lead content on first page
      response.leadContent.take(1).map(IndexPageItem(_)).filter(_.item.trail.webPublicationDate > leadContentCutOff)
    else
      Nil
    val leadContentIds = leadContent.map(_.item.metadata.id)

    val latest: Seq[IndexPageItem] = response.results.map(IndexPageItem(_)).filterNot(c => leadContentIds.contains(c.item.metadata.id))
    val allTrails = (leadContent ++ editorsPicks ++ latest).distinctBy(_.item.metadata.id)
    tag map { tag => IndexPage(tag, allTrails, Tags(Seq(tag))) }
  }

  // for some reason and for the life of me I cannot figure it out, this does not compile if these
  // are at the top of the file :(
  val SinglePart = """([\w\d\.-]+)""".r
  val SeriesInSameSection = """(series/[\w\d\.-]+)""".r
  val UkNewsSection = """^uk-news/(.+)$""".r
}

object Index extends Index


