package services

import _root_.model.Content
import com.gu.contentapi.client.model.{Content => ApiContent, Tag}
import com.gu.facia.api.models.{CollectionConfig, FaciaContent}
import common._
import conf.LiveContentApi
import implicits.Dates
import layout.{CollectionEssentials, FaciaContainer}
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTimeConstants, DateTime, DateTimeZone}
import slices.{ContainerDefinition, Fixed, FixedContainers, TTT}

import scala.concurrent.Future

case class BookSectionContent(tag: Tag, content: List[ApiContent])
case class ContentByPage(page: Int, content: ApiContent)
case class TagWithContent(tag: Tag, content: ApiContent)
case class BookSectionContentByPage(page: Int, booksectionContent: BookSectionContent)

object NewspaperQuery extends ExecutionContexts with Dates with Logging {

  val dateForFrontPagePattern = DateTimeFormat.forPattern("EEEE d MMMM y")
  val FRONT_PAGE_DISPLAY_NAME = "Front Page"

  def fetchTodaysPaper: Future[List[FaciaContainer]] =
    bookSectionContainers(DateTime.now(DateTimeZone.UTC))


  def fetchPaperForDate(day: String, month: String, year: String): Future[List[FaciaContainer]] = {
    val dateFormatUTC = DateTimeFormat.forPattern("yyyy/MMM/dd").withZone(DateTimeZone.UTC)

    val date = dateFormatUTC
      .parseDateTime(s"$year/$month/$day")
      .withTimeAtStartOfDay()
      .plusDays(1)
      .minusSeconds(1)
      .toDateTime

    bookSectionContainers(date)
  }


  private def bookSectionContainers(date: DateTime): Future[List[FaciaContainer]] = {

    val newspaperDate = if(date.getDayOfWeek() == DateTimeConstants.SUNDAY) date.minusDays(1) else date

    val itemQuery = LiveContentApi.item("theguardian/mainsection")
      .useDate("newspaper-edition")
      .showFields("all")
      .showElements("all")
      .showTags("newspaper-book-section")
      .pageSize(200)
      .fromDate(newspaperDate.withTimeAtStartOfDay())
      .toDate(newspaperDate)

    LiveContentApi.getResponse(itemQuery).map { resp =>

      //filter out the first page results to make a Front Page container
      val (firstPageContent, otherContent) = resp.results.partition(content => getNewspaperPageNumber(content).contains(1))

      val firstPageContainer = {
        val content = firstPageContent.map(c => FaciaContentConvert.frontendContentToFaciaContent(Content(c)))

        bookSectionContainer(None, Some(FRONT_PAGE_DISPLAY_NAME), Some(newspaperDate.toString(dateForFrontPagePattern)), content, 0)
      }

      val unorderedBookSections = createBookSections(otherContent)
      val orderedBookSections = orderByPageNumber(unorderedBookSections)

      val bookSectionContainers = orderedBookSections.map { list =>
        val content = list.content.map(c => FaciaContentConvert.frontendContentToFaciaContent(Content(c)))
        bookSectionContainer(Some(list.tag.id), Some(list.tag.webTitle), None, content, orderedBookSections.indexOf(list) + 1)
      }

      firstPageContainer :: bookSectionContainers
    }
  }

  private def createBookSections(contentList: List[ApiContent]): List[BookSectionContent] = {
    val tagWithContent: List[TagWithContent] = contentList.flatMap { content =>
      content.tags.find(_.`type` == "newspaper-book-section").map(t => TagWithContent(t, content))
    }

    //group content by booksection tag type
    tagWithContent.groupBy(_.tag).map( bookSectionContent => BookSectionContent(bookSectionContent._1, bookSectionContent._2.map(_.content))).toList
  }

  private def orderByPageNumber(unorderedBookSections: List[BookSectionContent]): List[BookSectionContent] = {

    //order content for each book section
    val orderedContentForBookSection: List[BookSectionContent] = unorderedBookSections.map { bookSection =>
      bookSection.copy(content = orderContentByPageNumber(bookSection.content))
    }

    //order booksections by first content item in each booksection
    val pageNumberToFaciaContainer: List[BookSectionContentByPage] = orderedContentForBookSection.flatMap { bookSection =>
      val pageNumberOpt = bookSection.content.headOption.flatMap(content => getNewspaperPageNumber(content))
      pageNumberOpt.map(BookSectionContentByPage(_, bookSection))
    }
    pageNumberToFaciaContainer.sortBy(_.page).map(_.booksectionContent)
  }

  private def orderContentByPageNumber(unorderedContent: List[ApiContent]): List[ApiContent] = {
    val pageNumberToContent: List[ContentByPage] = unorderedContent.flatMap { content =>
      getNewspaperPageNumber(content).map(ContentByPage(_, content))
    }
    pageNumberToContent.sortBy(_.page).map(_.content)
  }

  private def bookSectionContainer(dataId: Option[String], containerName: Option[String],
                                   containerDescription: Option[String], trails: Seq[FaciaContent], index: Int): FaciaContainer = {
    val containerDefinition = trails.length match {
      case 1 => FixedContainers.fixedSmallSlowI
      case 2 => FixedContainers.fixedSmallSlowII
      case 3 => ContainerDefinition.ofSlices(TTT)
      case 5 => FixedContainers.fixedSmallSlowVThird
      case _ => FixedContainers.fixedMediumFastXII }

    FaciaContainer(
      index,
      Fixed(containerDefinition),
      CollectionConfigWithId(dataId.getOrElse(""), CollectionConfig.empty.copy(displayName = containerName, description = containerDescription)),
      CollectionEssentials(trails, Nil, containerName, dataId, None, None)
    ).copy(hasShowMoreEnabled = false)
  }

  private def getNewspaperPageNumber(content: ApiContent) = content.fields.getOrElse(Map.empty).get("newspaperPageNumber").map(_.toInt)
}
