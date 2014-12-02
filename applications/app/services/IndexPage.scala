package services

import com.gu.facia.client.models.CollectionConfig
import common.Edition
import conf.Switches
import contentapi.{Zones, Paths}
import layout._
import model._
import org.joda.time.DateTime
import slices.{Fixed, FixedContainers, ContainerDefinition}
import views.support.{TagKicker, CartoonKicker, ReviewKicker}
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
  def fastContainerWithMpu(numberOfItems: Int): Option[ContainerDefinition] = numberOfItems match {
    case 2 => Some(FixedContainers.fastIndexPageMpuII)
    case 4 => Some(FixedContainers.fastIndexPageMpuIV)
    case 6 => Some(FixedContainers.fastIndexPageMpuVI)
    case n if n >= 9 => Some(FixedContainers.fastIndexPageMpuIX)
    case _ => None
  }

  def slowContainerWithMpu(numberOfItems: Int): Option[ContainerDefinition] = numberOfItems match {
    case 2 => Some(FixedContainers.slowIndexPageMpuII)
    case 4 => Some(FixedContainers.slowIndexPageMpuIV)
    case 5 => Some(FixedContainers.slowIndexPageMpuV)
    case 7 => Some(FixedContainers.slowIndexPageMpuVII)
    case _ => None
  }

  def makeFront(indexPage: IndexPage, edition: Edition) = {
    val isCartoonPage = indexPage.isTagWithId("type/cartoon")
    val isReviewPage = indexPage.isTagWithId("tone/reviews")

    val isSlow = SlowOrFastByTrails.isSlow(indexPage.trails)

    val grouped = if (isSlow)
      IndexPageGrouping.byDay(indexPage.trails, edition.timezone)
    else
      IndexPageGrouping.fromContent(indexPage.trails, edition.timezone)

    val containerDefinitions = grouped.toList.mapAccumL(MpuState(injected = false)) {
      case (mpuState, grouping) =>
        val collection = CollectionEssentials.fromTrails(
          grouping.items
        )

        val mpuContainer = (if (isSlow)
          slowContainerWithMpu(grouping.items.length)
        else
          fastContainerWithMpu(grouping.items.length)).filter(const(!mpuState.injected))

        val (container, newMpuState) = mpuContainer map { mpuContainer =>
          (mpuContainer, mpuState.copy(injected = true))
        } getOrElse {
          val containerDefinition = if (isSlow) {
            ContainerDefinition.slowForNumberOfItems(grouping.items.length)
          } else {
            ContainerDefinition.fastForNumberOfItems(grouping.items.length)
          }

          (containerDefinition, mpuState)
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
          case zone: Zone => FaciaContainerHeader.fromZone(zone, headline)
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
        case MetaDataHeader(_, _, _, dateHeadline, _) => cardTimestampDisplay(dateHeadline)
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
  private def isSectionKeyword(sectionId: String, id: String) = Set(
    Some(s"$sectionId/$sectionId"),
    Paths.withoutEdition(sectionId) map { idWithoutEdition => s"$idWithoutEdition/$idWithoutEdition" }
  ).flatten contains id

  def isTagWithId(id: String) = page match {
    case section: Section =>
      isSectionKeyword(section.id, id)

    case zone: Zone =>
      isSectionKeyword(zone.id, id)

    case tag: Tag => tag.id == id

    case combiner: TagCombiner =>
      combiner.leftTag.id == id || combiner.rightTag.id == id

    case _ => false
  }

  def allPath = {
    val withoutEdition = Paths.withoutEdition(page.id)

    if (withoutEdition.exists(Zones.ById.contains)) {
      s"/$withoutEdition"
    } else {
      s"/${page.id}"
    }
  }
}
