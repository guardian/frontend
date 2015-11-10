package services

import _root_.model.Content
import com.gu.contentapi.client.model.{Content => ApiContent, Tag}
import com.gu.facia.api.models.{CollectionConfig, FaciaContent}
import common._
import conf.LiveContentApi
import implicits.Dates
import layout.{CollectionEssentials, FaciaContainer}
import org.joda.time.{DateTime, DateTimeZone}
import slices.{ContainerDefinition, Fixed, FixedContainers, TTT}

import scala.concurrent.Future

case class TagWithContent(tag: Tag, content: ApiContent)
case class BookSectionContent(tag: Tag, content: List[ApiContent])

object TodaysNewspaperQuery extends ExecutionContexts with Dates with Logging {

  def fetchTodaysPaper: Future[List[FaciaContainer]] = {
    val today = DateTime.now(DateTimeZone.UTC)

    val item = LiveContentApi.item("theguardian/mainsection")
      .useDate("newspaper-edition")
      .showFields("all")
      .showElements("all")
      .showTags("newspaper-book-section")
      .pageSize(200)
      .fromDate(today.withTimeAtStartOfDay())
      .toDate(today)

    LiveContentApi.getResponse(item).map { resp =>

      //filter out the first page results to make a Front Page container
      val (firstPageContent, otherContent) = resp.results.partition(content => getNewspaperPageNumber(content).contains(1))

      val firstPageContainer = {
        val content = firstPageContent.map(c => FaciaContentConvert.frontendContentToFaciaContent(Content(c)))
        bookSectionContainer(None, Some("Front Page"), content, 0)
      }

      val unorderedBookSections = createBookSections(otherContent)
      val orderedBookSections = orderByPageNumber(unorderedBookSections)

      val bookSectionContainers = orderedBookSections.map { list =>
        val content = list.content.map(c => FaciaContentConvert.frontendContentToFaciaContent(Content(c)))
        bookSectionContainer(Some(list.tag.id), Some(list.tag.webTitle), content, orderedBookSections.indexOf(list) + 1)
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
    val pageNumberToFaciaContainer: List[(Int, BookSectionContent)] = orderedContentForBookSection.flatMap { bookSection =>
      val pageNumberOpt = bookSection.content.headOption.flatMap(content => getNewspaperPageNumber(content))
      pageNumberOpt.map(_ -> bookSection)

    }
    pageNumberToFaciaContainer.sortBy(_._1).map(_._2)
  }


  private def orderContentByPageNumber(unorderedContent: List[ApiContent]): List[ApiContent] = {
    val pageNumberToContent: List[(Int, ApiContent)] = unorderedContent.flatMap { content =>
      getNewspaperPageNumber(content).map(_ -> content)
    }
    pageNumberToContent.sortBy(_._1).map(_._2)
  }

  private def bookSectionContainer(dataId: Option[String], displayName: Option[String], trails: Seq[FaciaContent], index: Int): FaciaContainer = {
    val containerDefinition = trails.length match {
      case 1 => FixedContainers.fixedSmallSlowI
      case 2 => FixedContainers.fixedSmallSlowII
      case 3 => ContainerDefinition.ofSlices(TTT)
      case _ => FixedContainers.fixedMediumFastXII }

    FaciaContainer(
      index,
      Fixed(containerDefinition),
      CollectionConfigWithId(dataId.getOrElse(""), CollectionConfig.empty.copy(displayName = displayName)),
      CollectionEssentials(trails, Nil, displayName, dataId, None, None)
    ).copy(hasShowMoreEnabled = false)
  }

  private def getNewspaperPageNumber(content: ApiContent) = content.fields.getOrElse(Map.empty).get("newspaperPageNumber").map(_.toInt)
}
