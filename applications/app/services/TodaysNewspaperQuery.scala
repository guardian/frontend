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


      val unorderedBookSections = createBookSections(resp.results)
      val orderedBookSections = orderBookSectionsByPageNumber(unorderedBookSections)

      orderedBookSections.map { list =>
        val content = list.content.map(c => FaciaContentConvert.frontendContentToFaciaContent(Content(c)))
        bookSectionContainer(list.tag.id, Some(list.tag.webTitle), content, orderedBookSections.indexOf(list))
      }
    }
  }

  private def createBookSections(contentList: List[ApiContent]): List[BookSectionContent] = {
    val tagWithContent: List[TagWithContent] = contentList.flatMap { content =>
      content.tags.find(_.`type` == "newspaper-book-section").map(t => TagWithContent(t, content))
    }

    //group content by booksection tag type
    tagWithContent.groupBy(_.tag).map( bookSectionContent => BookSectionContent(bookSectionContent._1, bookSectionContent._2.map(_.content))).toList
  }

  private def orderBookSectionsByPageNumber(unorderedBookSections: List[BookSectionContent]): List[BookSectionContent] = {

    //order content for each book section
    val orderedContentForBookSection: List[BookSectionContent] = unorderedBookSections.map { bookSection =>
      bookSection.copy(content = getResultsOrderByNewspaperNumber(bookSection.content))
    }

    //order booksections by first content item in each booksection
    val pageNumberToFaciaContainer: List[(Int, BookSectionContent)] = orderedContentForBookSection.flatMap { bookSection =>
      val pageNumberOpt = bookSection.content.headOption.flatMap(c => c.fields.getOrElse(Map.empty).get("newspaperPageNumber").map(_.toInt))
      pageNumberOpt.map(_ -> bookSection)

    }
    pageNumberToFaciaContainer.sortBy(_._1).map(_._2)
  }


  private def getResultsOrderByNewspaperNumber(unorderedContent: List[ApiContent]): List[ApiContent] = {
    val pageNumberToContent: List[(Int, ApiContent)] = unorderedContent.flatMap { c =>
      val pageNumberOpt = c.fields.getOrElse(Map.empty).get("newspaperPageNumber").map(_.toInt)
      pageNumberOpt.map(_ -> c)
    }
    pageNumberToContent.sortBy(_._1).map(_._2)
  }

  private def bookSectionContainer(dataId: String, displayName: Option[String], trails: Seq[FaciaContent], index: Int): FaciaContainer = {
    val containerDefinition = trails.length match {
      case 1 => FixedContainers.fixedSmallSlowI
      case 2 => FixedContainers.fixedSmallSlowII
      case 3 => ContainerDefinition.ofSlices(TTT)
      case _ => FixedContainers.fixedMediumFastXII }

    FaciaContainer(
      index,
      Fixed(containerDefinition),
      CollectionConfigWithId(dataId, CollectionConfig.empty.copy(displayName = displayName)),
      CollectionEssentials(trails, Nil, displayName, Some(dataId), None, None)
    )
  }
}
