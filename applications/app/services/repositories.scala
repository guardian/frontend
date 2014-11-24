package services

import com.gu.facia.client.models.CollectionConfig
import layout._
import model._
import conf.{Switches, InlineRelatedContentSwitch, LiveContentApi}
import model.Section
import common._
import com.gu.contentapi.client.model.{SearchResponse, ItemResponse}
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._
import contentapi.{Paths, QueryDefaults}
import slices._
import views.support.{ReviewKicker, TagKicker, CartoonKicker}
import scala.concurrent.Future
import play.api.mvc.{RequestHeader, Result => PlayResult}
import com.gu.contentapi.client.GuardianContentApiError
import controllers.ImageContentPage
import implicits.Dates._
import common.JodaTime._
import common.Seqs._
import scalaz.syntax.traverse._
import scalaz.std.list._
import Function.const
import DateHeadline.cardTimestampDisplay

object IndexPagePagination {
  def pageSize: Int = if (Switches.TagPageSizeSwitch.isSwitchedOn) {
    35
  } else {
    20
  }

  def rssPageSize: Int = 20
}

case class MpuState(injected: Boolean)

object IndexPage {
  def containerWithMpu(numberOfItems: Int): Option[ContainerDefinition] = numberOfItems match {
    case 2 => Some(FixedContainers.indexPageMpuII)
    case 4 => Some(FixedContainers.indexPageMpuIV)
    case 6 => Some(FixedContainers.indexPageMpuVI)
    case n if n >= 9 => Some(FixedContainers.indexPageMpuIX)
    case _ => None
  }

  def makeFront(indexPage: IndexPage, edition: Edition) = {
    val isCartoonPage = indexPage.isTagWithId("type/cartoon")
    val isReviewPage = indexPage.isTagWithId("tone/reviews")

    val grouped = IndexPageGrouping.fromContent(indexPage.trails, edition.timezone)

    val containerDefinitions = grouped.toList.mapAccumL(MpuState(injected = false)) {
      case (mpuState, grouping) =>
        val collection = CollectionEssentials.fromTrails(
          grouping.items
        )

        val (container, newMpuState) = containerWithMpu(grouping.items.length).filter(const(!mpuState.injected)) map { mpuContainer =>
          (mpuContainer, mpuState.copy(injected = true))
        } getOrElse {
          (ContainerDefinition.forNumberOfItems(grouping.items.length), mpuState)
        }

        val containerConfig = ContainerDisplayConfig(
          CollectionConfigWithId(grouping.dateHeadline.displayString, CollectionConfig.emptyConfig.copy(
            displayName = Some(grouping.dateHeadline.displayString)
          )),
          showSeriesAndBlogKickers = true
        )

        (newMpuState, ((containerConfig, collection), Fixed(container)))
    }._2.toSeq

    val front = Front.fromConfigsAndContainers(
      containerDefinitions,
      ContainerLayoutContext(Set.empty, hideCutOuts = indexPage.page.isContributorPage)
    )

    val headers = grouped.map(_.dateHeadline).zipWithIndex map { case (headline, index) =>
      if (index == 0) {
        indexPage.page match {
          case tag: Tag => FaciaContainerHeader.fromTagPage(tag, headline)
          case section: Section => FaciaContainerHeader.fromSection(section, headline)
          case page: Page => FaciaContainerHeader.fromPage(page, headline)
          case _ =>
            // should never happen
            LoneDateHeadline(headline)
        }
      } else {
        LoneDateHeadline(headline)
      }
    }

    front.copy(containers = front.containers.zip(headers).map({ case (container, header) =>
      val timeStampDisplay = header match {
        case MetaDataHeader(_, _, _, dateHeadline) => cardTimestampDisplay(dateHeadline)
        case LoneDateHeadline(dateHeadline) => cardTimestampDisplay(dateHeadline)
      }

      container.copy(
        customHeader = Some(header),
        customClasses = Some(Seq("fc-container--tag")),
        hideToggle = true,
        showTimestamps = true,
        dateLinkPath = Some(s"/${indexPage.page.id}")
      ).transformCards({ card =>
        card.copy(
          timeStampDisplay = Some(timeStampDisplay),
          byline = if (indexPage.page.isContributorPage) None else card.byline
        ).setKicker(card.header.kicker flatMap {
          case ReviewKicker if isReviewPage => None
          case CartoonKicker if isCartoonPage => None
          case TagKicker(_, _, id) if indexPage.isTagWithId(id) => None
          case otherKicker => Some(otherKicker)
        })
      })
    }))
  }
}

case class IndexPage(page: MetaData, trails: Seq[Content],
                     date: DateTime = DateTime.now) {
  def isTagWithId(id: String) = page match {
    case section: Section =>
      val sectionId = section.id
      
      Set(
        Some(s"$sectionId/$sectionId"),
        Paths.withoutEdition(sectionId) map { idWithoutEdition => s"$idWithoutEdition/$idWithoutEdition" }
      ).flatten contains id

    case tag: Tag => tag.id == id

    case combiner: TagCombiner =>
      combiner.leftTag.id == id || combiner.rightTag.id == id

    case _ => false
  }
}

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

  def index(edition: Edition, leftSide: String, rightSide: String, page: Int, isRss: Boolean): Future[Either[IndexPage, PlayResult]] = {

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

    val promiseOfResponse = LiveContentApi.search(edition)
      .tag(s"$firstTag,$secondTag")
      .page(page)
      .pageSize(if (isRss) IndexPagePagination.rssPageSize else IndexPagePagination.pageSize)
      .showFields(if (isRss) rssFields else trailFields)
      .response.map {response =>
      val trails = response.results map { Content(_) }
      trails match {
        case Nil => Right(NotFound)
        case head :: _ =>
          //we can use .head here as the query is guaranteed to return the 2 tags
          val tag1 = findTag(head, firstTag)
          val tag2 = findTag(head, secondTag)

          val page = new TagCombiner(s"$leftSide+$rightSide", tag1, tag2, pagination(response))

          Left(IndexPage(page, trails))
      }
    }

    promiseOfResponse.recover(convertApiExceptions)
      //this is the best handle we have on a wrong 'page' number
      .recover{ case GuardianContentApiError(400, _) => Right(Found(s"/$leftSide+$rightSide")) }
  }

  private def findTag(content: Content, tagId: String) = content.tags.filter(tag =>
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

    val promiseOfResponse = LiveContentApi.item(path, edition)
      .page(pageNum)
      .pageSize(if (isRss) IndexPagePagination.rssPageSize else IndexPagePagination.pageSize)
      .showEditorsPicks(pageNum == 1) //only show ed pics on first page
      .showFields(if (isRss) rssFields else trailFields)
      .response.map {
      response =>
        val page = response.tag.flatMap(t => tag(response, pageNum))
          .orElse(response.section.flatMap(t => section(response)))
        ModelOrResult(page, response)
    }
    promiseOfResponse.recover(convertApiExceptions)
      //this is the best handle we have on a wrong 'page' number
      .recover{ case GuardianContentApiError(400, _) if pageNum != 1 => Right(Found(s"/$path")) }
  }



  private def section(response: ItemResponse) = {
      val section = response.section.map{Section(_, pagination(response))}
      val editorsPicks = response.editorsPicks.map(Content(_))
      val editorsPicksIds = editorsPicks.map(_.id)
      val latestContent = response.results.map(Content(_)).filterNot(c => editorsPicksIds contains c.id)
      val trails = editorsPicks ++ latestContent
      section.map(IndexPage(_, trails))
  }

  private def tag(response: ItemResponse, page: Int) = {
    val tag = response.tag map { new Tag(_, pagination(response)) }
    val leadContentCutOff = DateTime.now - leadContentMaxAge
    val editorsPicks = response.editorsPicks.map(Content(_))
    val leadContent = if (editorsPicks.isEmpty && page == 1) //only promote lead content on first page
      response.leadContent.take(1).map(Content(_)).filter(_.webPublicationDate > leadContentCutOff)
    else
      Nil

    val latest: Seq[Content] = response.results.map(Content(_)).filterNot(c => leadContent.map(_.id).contains(c.id))
    val allTrails = (leadContent ++ editorsPicks ++ latest).distinctBy(_.id)
    tag map { IndexPage(_, allTrails) }
  }

  // for some reason and for the life of me I cannot figure it out, this does not compile if these
  // are at the top of the file :(
  val SinglePart = """([\w\d\.-]+)""".r
  val SeriesInSameSection = """(series/[\w\d\.-]+)""".r
  val UkNewsSection = """^uk-news/(.+)$""".r
}

object Index extends Index

trait ImageQuery extends ConciergeRepository {

  def image(edition: Edition, path: String): Future[Either[ImageContentPage, PlayResult]]= {
    log.info(s"Fetching image content: $path for edition ${edition.id}")
    val response = LiveContentApi.item(path, edition)
      .showFields("all")
      .showRelated(InlineRelatedContentSwitch.isSwitchedOn)
      .response.map { response:ItemResponse =>
      val mainContent: Option[Content] = response.content.filter { c => c.isImageContent } map {Content(_)}
      val storyPackage: List[Trail] = response.storyPackage map { Content(_) }
      mainContent.map { content => Left(ImageContentPage(content, RelatedContent(content, response))) }.getOrElse(Right(NotFound))
    }

    response recover convertApiExceptions
  }
}
