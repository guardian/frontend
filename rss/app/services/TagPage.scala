package services

import com.gu.commercial.branding.Branding
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common.{Edition, LinkTo}
import conf.switches.Switches
import contentapi.Paths
import layout.DateHeadline.cardTimestampDisplay
import layout._
import layout.slices.{Container, ContainerDefinition, Fixed, FixedContainers}
import model._
import model.meta.{ItemList, ListItem}
import model.pressed._
import org.joda.time.{DateTime, DateTimeZone}
import play.api.mvc.RequestHeader
import views.support.PreviousAndNext

import scala.Function.const
import scala.annotation.tailrec

object TagPagePagination {
  def pageSize: Int = 20
}

case class MpuState(injected: Boolean)

object TagPage {

  def apply(
    page: Page,
    contents: Seq[TagPageItem],
    tags: Tags,
    date: DateTime,
    tzOverride: Option[DateTimeZone]
  ): TagPage = {
    TagPage(page, contents, tags, date, tzOverride, commercial = Commercial.empty)
  }

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

  def makeFront(tagPage: TagPage, edition: Edition)(implicit context: ApplicationContext): Front = {
    val isCartoonPage = tagPage.isTagWithId("type/cartoon")
    val isReviewPage = tagPage.isTagWithId("tone/reviews")

    val isSlow = SlowOrFastByTrails.isSlow(tagPage.trails.map(_.trail))

    @tailrec
    def containerDefinition(groupings: Seq[TagPageGrouping],
                            mpuState: MpuState,
                            accumulation: Vector[((ContainerDisplayConfig, CollectionEssentials), Container)] = Vector.empty
                           ): Seq[((ContainerDisplayConfig, CollectionEssentials), Container)] = {
      groupings.toList match {
        case Nil => accumulation
        case grouping :: remainingGroupings =>
        val collection = CollectionEssentials.fromFaciaContent(
          grouping.items.flatMap { item =>
            tagPage.contents.find(_.item.metadata.id == item.metadata.id).map(_.faciaItem)
          }
        )

        val mpuContainer = (if (isSlow)
          slowContainerWithMpu(grouping.items.length)
        else
          fastContainerWithMpu(grouping.items.length)).filter(const(!mpuState.injected))

        val (container, newMpuState) = mpuContainer map { mpuContainer =>
          (mpuContainer, mpuState.copy(injected = true))
        } getOrElse {
          val definition = if (isSlow) {
            ContainerDefinition.slowForNumberOfItems(grouping.items.length)
          } else {
            ContainerDefinition.fastForNumberOfItems(grouping.items.length)
          }

          (definition, mpuState)
        }

        val containerConfig = ContainerDisplayConfig(
          CollectionConfigWithId(grouping.dateHeadline.displayString, CollectionConfig.empty.copy(
            displayName = Some(grouping.dateHeadline.displayString)
          )),
          showSeriesAndBlogKickers = true
        )

        containerDefinition(
          remainingGroupings,
          newMpuState,
          accumulation :+ ((containerConfig, collection), Fixed(container))
        )
      }

    }

    val grouped = if (isSlow || tagPage.forcesDayView)
      TagPageGrouping.byDay(tagPage.trails, edition.timezone)
    else
      TagPageGrouping.fromContent(tagPage.trails, edition.timezone)

    val front = Front.fromConfigsAndContainers(
      containerDefinition(grouped.toList, MpuState(injected = false)),
      ContainerLayoutContext(
        Set.empty,
        hideCutOuts = tagPage.tags.isContributorPage
      )
    )

    val headers = grouped.map(_.dateHeadline).zipWithIndex map { case (headline, index) =>
      if (index == 0) {
        tagPage.page match {
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
        case MetaDataHeader(_, _, _, dateHeadline, _) => Some(cardTimestampDisplay(dateHeadline))
        case LoneDateHeadline(dateHeadline) => Some(cardTimestampDisplay(dateHeadline))
        case DescriptionMetaHeader(_) => None
      }
      container.copy(
        customHeader = Some(header),
        customClasses = Some(Seq(
          Some("fc-container--tag"),
          if (container.index == 0 &&
              tagPage.isFootballTeam &&
              Switches.FixturesAndResultsContainerSwitch.isSwitchedOn)  Some("js-insert-team-stats-after") else None
        ).flatten),
        hideToggle = true,
        showTimestamps = true,
        useShowMore = false,
        dateLinkPath = Some(s"/${tagPage.idWithoutEdition}")
      ).transformCards({ card =>
        card.copy(
          timeStampDisplay = timeStampDisplay,
          byline = if (tagPage.tags.isContributorPage) None else card.byline,
          useShortByline = true
        ).setKicker(card.header.kicker flatMap {
          case ReviewKicker if isReviewPage => None
          case CartoonKicker if isCartoonPage => None
          case TagKicker(_, _, _, id) if tagPage.isTagWithId(id) => None
          case otherKicker => Some(otherKicker)
        })
      })
    }))
  }

  def makeLinkedData(tagPage: TagPage)(implicit request: RequestHeader): ItemList = {
    ItemList(
      LinkTo(tagPage.page.metadata.url),
      tagPage.trails.zipWithIndex.map {
        case (trail, index) =>
          ListItem(position = index, url = Some(LinkTo(trail.metadata.url)))
      }
    )
  }

}
object TagPageItem {
  def apply(content: ApiContent): TagPageItem = {
    TagPageItem(
      Content(content),
      FaciaContentConvert.contentToFaciaContent(content))
  }
}
case class TagPageItem(
  item: ContentType,
  faciaItem: PressedContent
)

case class TagPage(
  page: Page,
  contents: Seq[TagPageItem],
  tags: Tags,
  date: DateTime,
  tzOverride: Option[DateTimeZone],
  commercial: Commercial,
  previousAndNext: Option[PreviousAndNext] = None
) extends StandalonePage {

  override val metadata: MetaData = page.metadata
  val trails: Seq[Content] = contents.map(_.item.content)
  val faciaTrails: Seq[PressedContent] = contents.map(_.faciaItem)

  private def isSectionKeyword(sectionId: String, id: String) = Set(
    Some(s"$sectionId/$sectionId"),
    Paths.withoutEdition(sectionId) map { idWithoutEdition => s"$idWithoutEdition/$idWithoutEdition" }
  ).flatten contains id

  def isTagWithId(id: String): Boolean = page match {
    case section: Section =>
      isSectionKeyword(section.metadata.id, id)

    case tag: Tag => tag.id == id

    case combiner: TagCombiner =>
      combiner.leftTag.id == id || combiner.rightTag.id == id

    case _ => false
  }

  def isFootballTeam: Boolean = page match {
    case tag: Tag => tag.isFootballTeam
    case _ => false
  }

  def forcesDayView: Boolean = page match {
    case tag: Tag if tag.metadata.sectionId == "crosswords" => false
    case tag: Tag => Set("Series", "Blog").contains(tag.properties.tagType)
    case _ => false
  }

  def idWithoutEdition: String = page match {
    case section: Section if section.isEditionalised => Paths.stripEditionIfPresent(section.metadata.id)
    case other => other.metadata.id
  }

  def allPath: String = s"/$idWithoutEdition"

  def branding(edition: Edition): Option[Branding] = page.metadata.commercial.flatMap(_.branding(edition))
}
