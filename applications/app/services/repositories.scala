package services

import model._
import conf.SwitchingContentApi
import model.Section
import common._
import com.gu.openplatform.contentapi.model.{SearchResponse, ItemResponse}
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._
import contentapi.QueryDefaults
import controllers.ImageContentPage
import scala.concurrent.Future
import play.api.mvc.{RequestHeader, SimpleResult}
import com.gu.openplatform.contentapi.ApiError

object IndexPagePagination {
  def pageSize: Int = 20 //have a good think before changing this
}

case class IndexPage(page: MetaData, trails: Seq[Content], pagination: Pagination)

trait Index extends ConciergeRepository with QueryDefaults {

  def index(edition: Edition, leftSide: String, rightSide: String, page: Int): Future[Either[IndexPage, SimpleResult]] = {

    val section = leftSide.split('/').head

    // if the first tag is just one part then change it to a section tag...
    val firstTag = leftSide match {
      case SinglePart(wordsForUrl) => s"$wordsForUrl/$wordsForUrl"
      case other => other
    }

    // if the second tag is just one part then it is in the same section as the first tag...
    val secondTag = rightSide match {
      case SinglePart(wordsForUrl) => s"$section/$wordsForUrl"
      case SeriesInSameSection(series) => s"$section/$series"
      case other => other
    }

    val promiseOfResponse = SwitchingContentApi().search(edition)
      .tag(s"$firstTag,$secondTag")
      .page(page)
      .pageSize(IndexPagePagination.pageSize)
      .response.map {response =>
        val trails = response.results map { Content(_) }
        trails match {
          case Nil => Right(NotFound)
          case head :: _ =>
            //we can use .head here as the query is guaranteed to return the 2 tags
            val tag1 = head.tags.find(_.id == firstTag).head
            val tag2 = head.tags.find(_.id == secondTag).head
            val pageName = s"${tag1.name} + ${tag2.name}"
            val page = Page(s"$leftSide+$rightSide", tag1.section, pageName, s"GFE:${tag1.section}:$pageName")
            Left(IndexPage(page, trails, pagination(response)))
        }
    }

    promiseOfResponse.recover(convertApiExceptions)
      //this is the best handle we have on a wrong 'page' number
      .recover{ case ApiError(400, _) => Right(Found(s"/$leftSide+$rightSide")) }
  }

  private def pagination(response: ItemResponse): Pagination = Pagination(
    response.currentPage.getOrElse(1),
    response.pages.getOrElse(1)
  )

  private def pagination(response: SearchResponse): Pagination = Pagination(
    response.currentPage,
    response.pages
  )

  def index(edition: Edition, path: String, pageNum: Int)(implicit request: RequestHeader): Future[Either[IndexPage, SimpleResult]] = {
    val promiseOfResponse = SwitchingContentApi().item(path, edition)
      .page(pageNum)
      .pageSize(IndexPagePagination.pageSize)
      .showEditorsPicks(pageNum == 1) //only show ed pics on first page
      .response.map {
      response =>
        val page = response.tag.flatMap(t => tag(response, pageNum))
          .orElse(response.section.flatMap(t => section(response)))
        ModelOrResult(page, response)
    }
    promiseOfResponse.recover(convertApiExceptions)
      //this is the best handle we have on a wrong 'page' number
      .recover{ case ApiError(400, _) => Right(Found(s"/$path")) }
  }



  private def section(response: ItemResponse) = {
      val section = response.section.map(Section)
      val editorsPicks = response.editorsPicks.map(Content(_))
      val editorsPicksIds = editorsPicks.map(_.id)
      val latestContent = response.results.map(Content(_)).filterNot(c => editorsPicksIds contains c.id)
      val trails = editorsPicks ++ latestContent
      section.map(IndexPage(_, trails, pagination(response)))
  }

  private def tag(response: ItemResponse, page: Int) = {
    val tag = response.tag map { new Tag(_) }
    val leadContentCutOff = DateTime.now - leadContentMaxAge
    val editorsPicks = response.editorsPicks.map(Content(_))
    val leadContent = if (editorsPicks.isEmpty && page == 1) //only promote lead content on first page
      response.leadContent.take(1).map(Content(_)).filter(_.webPublicationDate > leadContentCutOff)
    else
      Nil

    val latest: Seq[Content] = response.results.map(Content(_)).filterNot(c => leadContent.map(_.id).exists(_ == c.id))
    val allTrails = (leadContent ++ editorsPicks ++ latest).distinctBy(_.id)
    tag map { IndexPage(_, allTrails, pagination(response)) }
  }

  // for some reason and for the life of me I cannot figure it out, this does not compile if these
  // are at the top of the file :(
  val SinglePart = """([\w\d\.-]+)""".r
  val SeriesInSameSection = """(series/[\w\d\.-]+)""".r
}

trait ImageQuery extends ConciergeRepository with QueryDefaults {

  def image(edition: Edition, path: String): Future[Either[ImageContentPage, SimpleResult]]= {
    log.info(s"Fetching image content: $path for edition ${edition.id}")
    val response = SwitchingContentApi().item(path, edition)
      .showExpired(true)
      .showFields("all")
      .response.map { response =>
      val mainContent: Option[Content] = response.content.filter { c => c.isImageContent } map {Content(_)}
      val storyPackage: List[Trail] = response.storyPackage map { Content(_) }
      mainContent.map { content => Left(ImageContentPage(content,storyPackage)) }.getOrElse(Right(NotFound))
    }

    response recover convertApiExceptions
  }
}
