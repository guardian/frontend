package services

import com.gu.contentapi.client.model.v1.{Tag, Content => ApiContent}
import com.gu.facia.api.utils.{ContentProperties, ResolvedMetaData}
import com.gu.facia.api.{models => fapi}
import common._
import contentapi.ContentApiClient
import implicits.Dates
import layout.{CollectionEssentials, FaciaContainer}
import model.pressed.{CollectionConfig, LinkSnap, PressedContent}
import org.joda.time.format.DateTimeFormat
import org.joda.time.{DateTime, DateTimeConstants, DateTimeZone}
import layout.slices.{ContainerDefinition, Fixed, FixedContainers, TTT}

import scala.concurrent.{ExecutionContext, Future}

case class BookSectionContent(tag: Tag, content: Seq[ApiContent])
case class ContentByPage(page: Int, content: ApiContent)
case class TagWithContent(tag: Tag, content: ApiContent)
case class BookSectionContentByPage(page: Int, booksectionContent: BookSectionContent)

class NewspaperQuery(contentApiClient: ContentApiClient) extends Dates with Logging {

  val dateForFrontPagePattern = DateTimeFormat.forPattern("EEEE d MMMM y")
  private val hrefFormat = DateTimeFormat.forPattern("yyyy/MMM/dd").withZone(DateTimeZone.UTC)
  val FRONT_PAGE_DISPLAY_NAME = "front page"
  val pathToTag = Map("theguardian" -> "theguardian/mainsection", "theobserver" -> "theobserver/news")

  def fetchLatestGuardianNewspaper()(implicit executionContext: ExecutionContext): Future[List[FaciaContainer]] = {
    val now = DateTime.now(DateTimeZone.UTC)
    bookSectionContainers("theguardian/mainsection", getLatestGuardianPageFor(now), "theguardian")
  }

  def fetchLatestObserverNewspaper()(implicit executionContext: ExecutionContext): Future[List[FaciaContainer]] = {
    val now = DateTime.now(DateTimeZone.UTC)
    bookSectionContainers("theobserver/news", getPastSundayDateFor(now), "theobserver")
  }

  def fetchNewspaperForDate(path: String, day: String, month: String, year: String)(implicit executionContext: ExecutionContext): Future[List[FaciaContainer]] = {
    val dateFormatUTC = DateTimeFormat.forPattern("yyyy/MMM/dd").withZone(DateTimeZone.UTC)

    val date = dateFormatUTC
      .parseDateTime(s"$year/$month/$day")
      .toDateTime

    pathToTag.get(path).map(tag => bookSectionContainers(tag, date, path)).getOrElse(Future.successful(Nil))
  }


  private def bookSectionContainers(itemId: String, newspaperDate: DateTime, publication: String)(implicit executionContext: ExecutionContext): Future[List[FaciaContainer]] = {

    val startDate = newspaperDate.withTimeAtStartOfDay()

    val itemQuery = contentApiClient.item(itemId)
      .useDate("newspaper-edition")
      .showFields("all")
      .showElements("all")
      .showTags("newspaper-book-section")
      .pageSize(200)
      .fromDate(jodaToJavaInstant(startDate))
      .toDate(jodaToJavaInstant(newspaperDate))

    contentApiClient.getResponse(itemQuery).map { resp =>

      //filter out the first page results to make a Front Page container
      val (firstPageContent, otherContent) = resp.results.getOrElse(Nil).partition(content => getNewspaperPageNumber(content).contains(1))

      val firstPageContainer = {
        val content = firstPageContent.map(c => FaciaContentConvert.contentToFaciaContent(c))
        //for /theguardian fetch date links either side of date requested, for /theobserver, fetch each sunday around the date and the day before
        val snaps = createSnap(newspaperDate, publication)
        bookSectionContainer(None, Some(FRONT_PAGE_DISPLAY_NAME), Some(newspaperDate.toString(dateForFrontPagePattern)), content, 0, snaps)
      }

      val unorderedBookSections = createBookSections(otherContent)
      val orderedBookSections = orderByPageNumber(unorderedBookSections)

      val bookSectionContainers = orderedBookSections.map { list =>
        val content = list.content.map(c => FaciaContentConvert.contentToFaciaContent(c))
        bookSectionContainer(Some(list.tag.id), Some(lowercaseDisplayName(list.tag.webTitle)), None, content, orderedBookSections.indexOf(list) + 1, Nil)
      }

      firstPageContainer :: bookSectionContainers
    }
  }

  private def createBookSections(contentList: Seq[ApiContent]): List[BookSectionContent] = {
    val tagWithContent: Seq[TagWithContent] = contentList.flatMap { content =>
      content.tags.find(_.`type`.name == "NewspaperBookSection").map(t => TagWithContent(t, content))
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

  private def orderContentByPageNumber(unorderedContent: Seq[ApiContent]): Seq[ApiContent] = {
    val pageNumberToContent: Seq[ContentByPage] = unorderedContent.flatMap { content =>
      getNewspaperPageNumber(content).map(ContentByPage(_, content))
    }
    pageNumberToContent.sortBy(_.page).map(_.content)
  }

  private def bookSectionContainer(dataId: Option[String], containerName: Option[String],
                                   containerDescription: Option[String], trails: Seq[PressedContent], index: Int, linkSnaps: List[LinkSnap]): FaciaContainer = {
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
      CollectionEssentials(trails, linkSnaps, containerName, dataId, None, None)
    ).copy(hasShowMoreEnabled = false)
  }

  private def getNewspaperPageNumber(content: ApiContent) = content.fields.flatMap(_.newspaperPageNumber)

  def lowercaseDisplayName(s: String): String = if(s.equals("UK news") || s.equals("US news")) s else s.toLowerCase()

  def getPastSundayDateFor(date: DateTime): DateTime = {
    if(date.getDayOfWeek != DateTimeConstants.SUNDAY) {
      val daysSinceSunday = DateTimeConstants.SUNDAY - date.getDayOfWeek - 7
      date.minusDays(Math.abs(daysSinceSunday))
    } else date
  }

  def getLatestGuardianPageFor(date: DateTime): DateTime = if(date.getDayOfWeek == DateTimeConstants.SUNDAY) date.minusDays(1) else date


  private def createSnap(date: DateTime, publication: String) = {
    //if /theguardian get links for date either side of the date requests
    // else for theobserver get dates either sunday around the date and the previous Saturday.
    //filter out any dates in the future
    val daysAroundDateToFetchLinksFor = if(publication == "theguardian") List(1, -1) else List(7, -1, -7)
    val datesAroundNewspaperDate = daysAroundDateToFetchLinksFor.map(date.plusDays)
    datesAroundNewspaperDate.filter( d => d.isBeforeNow).map { d =>
      val displayFormat = d.toString(dateForFrontPagePattern)
      val hrefDateFormat = d.toString(hrefFormat).toLowerCase
      val href = if(d.getDayOfWeek == DateTimeConstants.SUNDAY) s"/theobserver/$hrefDateFormat" else s"/theguardian/$hrefDateFormat"
      val fapiSnap = fapi.LinkSnap(
        id = "no-id",
        maybeFrontPublicationDate = None,
        snapType = "no-snap-type",
        snapUri = None,
        snapCss = None,
        headline = Some(displayFormat),
        href = Some(href),
        trailText = None,
        group = "group",
        image = None,
        properties = ContentProperties.fromResolvedMetaData(ResolvedMetaData.Default),
        byline = None,
        kicker = None,
        brandingByEdition = Map.empty
      )
      LinkSnap.make(fapiSnap)
    }
  }
}
