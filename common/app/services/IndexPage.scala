package services

import com.gu.commercial.branding.Branding
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common.{Edition, LinkTo}
import conf.switches.Switches
import contentapi.Paths
import layout.DateHeadline.cardTimestampDisplay
import layout._
import model._
import model.meta.{ItemList, ListItem}
import model.pressed._
import org.joda.time.{DateTime, DateTimeZone}
import play.api.mvc.RequestHeader
import slices.{Container, ContainerDefinition, Fixed, FixedContainers}
import views.support.PreviousAndNext

import scala.Function.const
import scala.annotation.tailrec

object IndexPagePagination {
  def pageSize: Int = 20
}

case class MpuState(injected: Boolean)

object IndexPage {

  def apply(
      page: Page,
      contents: Seq[IndexPageItem],
      tags: Tags,
      date: DateTime,
      tzOverride: Option[DateTimeZone],
  ): IndexPage = {
    IndexPage(page, contents, tags, date, tzOverride, commercial = Commercial.empty)
  }

  def fastContainerWithMpu(numberOfItems: Int): Option[ContainerDefinition] =
    numberOfItems match {
      case 2           => Some(FixedContainers.fastIndexPageMpuII)
      case 4           => Some(FixedContainers.fastIndexPageMpuIV)
      case 6           => Some(FixedContainers.fastIndexPageMpuVI)
      case n if n >= 9 => Some(FixedContainers.fastIndexPageMpuIX)
      case _           => None
    }

  def slowContainerWithMpu(numberOfItems: Int): Option[ContainerDefinition] =
    numberOfItems match {
      case 2 => Some(FixedContainers.slowIndexPageMpuII)
      case 4 => Some(FixedContainers.slowIndexPageMpuIV)
      case 5 => Some(FixedContainers.slowIndexPageMpuV)
      case 7 => Some(FixedContainers.slowIndexPageMpuVII)
      case _ => None
    }

  // noinspection ScalaStyle
  def makeFront(indexPage: IndexPage, edition: Edition)(implicit context: ApplicationContext): Front = {
    val isCartoonPage = indexPage.isTagWithId("type/cartoon")
    val isReviewPage = indexPage.isTagWithId("tone/reviews")

    val isSlow = SlowOrFastByTrails.isSlow(indexPage.trails.map(_.trail))

    @tailrec
    def containerDefinition(
        groupings: Seq[IndexPageGrouping],
        mpuState: MpuState,
        accumulation: Vector[((ContainerDisplayConfig, CollectionEssentials), Container)] = Vector.empty,
    ): Seq[((ContainerDisplayConfig, CollectionEssentials), Container)] = {
      groupings.toList match {
        case Nil                            => accumulation
        case grouping :: remainingGroupings =>
          val collection = CollectionEssentials.fromFaciaContent(
            grouping.items.flatMap { item =>
              indexPage.contents.find(_.item.metadata.id == item.metadata.id).map(_.faciaItem)
            },
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
            CollectionConfigWithId(
              grouping.dateHeadline.displayString,
              CollectionConfig.empty.copy(
                displayName = Some(grouping.dateHeadline.displayString),
              ),
            ),
            showSeriesAndBlogKickers = true,
          )

          containerDefinition(
            remainingGroupings,
            newMpuState,
            accumulation :+ ((containerConfig, collection), Fixed(container)),
          )
      }

    }

    val grouped =
      if (isSlow || indexPage.forcesDayView)
        IndexPageGrouping.byDay(indexPage.trails, edition.timezone)
      else
        IndexPageGrouping.fromContent(indexPage.trails, edition.timezone)

    val front = Front.fromConfigsAndContainers(
      containerDefinition(grouped.toList, MpuState(injected = false)),
      ContainerLayoutContext(
        Set.empty,
        hideCutOuts = indexPage.tags.isContributorPage,
      ),
    )

    val headers = grouped.map(_.dateHeadline).zipWithIndex map { case (headline, index) =>
      if (index == 0) {
        indexPage.page match {
          case tag: Tag         => FaciaContainerHeader.fromTagPage(tag, headline)
          case section: Section => FaciaContainerHeader.fromSection(section, headline)
          case page: Page       => FaciaContainerHeader.fromPage(page, headline)
          case _                =>
            // should never happen
            LoneDateHeadline(headline)
        }
      } else {
        LoneDateHeadline(headline)
      }
    }

    front.copy(containers =
      front.containers
        .zip(headers)
        .map({ case (container, header) =>
          val timeStampDisplay = header match {
            case MetaDataHeader(_, _, _, dateHeadline, _) => Some(cardTimestampDisplay(dateHeadline))
            case LoneDateHeadline(dateHeadline)           => Some(cardTimestampDisplay(dateHeadline))
            case DescriptionMetaHeader(_)                 => None
          }
          container
            .copy(
              customHeader = Some(header),
              customClasses = Some(
                Seq(
                  Some("fc-container--tag"),
                  if (
                    container.index == 0 &&
                    indexPage.isFootballTeam &&
                    Switches.FixturesAndResultsContainerSwitch.isSwitchedOn
                  ) Some("js-insert-team-stats-after")
                  else None,
                ).flatten,
              ),
              hideToggle = true,
              showTimestamps = true,
              useShowMore = false,
              dateLinkPath = Some(s"/${indexPage.idWithoutEdition}"),
            )
            .transformCards({ card =>
              card
                .copy(
                  timeStampDisplay = timeStampDisplay,
                  byline = if (indexPage.tags.isContributorPage) None else card.byline,
                  useShortByline = true,
                )
                .setKicker(card.header.kicker flatMap {
                  case ReviewKicker if isReviewPage                        => None
                  case CartoonKicker if isCartoonPage                      => None
                  case TagKicker(_, _, _, id) if indexPage.isTagWithId(id) => None
                  case otherKicker                                         => Some(otherKicker)
                })
            })
        }),
    )
  }

  def makeLinkedData(indexPage: IndexPage)(implicit request: RequestHeader): ItemList = {
    ItemList(
      url = LinkTo(indexPage.page.metadata.url),
      itemListElement = indexPage.trails.zipWithIndex.map { case (trail, index) =>
        ListItem(position = index, url = Some(LinkTo(trail.metadata.url)))
      },
    )
  }

}
object IndexPageItem {
  def apply(content: ApiContent): IndexPageItem = {
    IndexPageItem(Content(content), FaciaContentConvert.contentToFaciaContent(content))
  }
}
case class IndexPageItem(
    item: ContentType,
    faciaItem: PressedContent,
)

case class IndexPage(
    page: Page,
    contents: Seq[IndexPageItem],
    tags: Tags,
    date: DateTime,
    tzOverride: Option[DateTimeZone],
    commercial: Commercial,
    previousAndNext: Option[PreviousAndNext] = None,
) extends StandalonePage {

  override val metadata: MetaData = page.metadata
  val trails: Seq[Content] = contents.map(_.item.content)
  val faciaTrails: Seq[PressedContent] = contents.map(_.faciaItem)

  private def isSectionKeyword(sectionId: String, id: String) =
    Set(
      Some(s"$sectionId/$sectionId"),
      Paths.withoutEdition(sectionId) map { idWithoutEdition => s"$idWithoutEdition/$idWithoutEdition" },
    ).flatten contains id

  def isTagWithId(id: String): Boolean =
    page match {
      case section: Section =>
        isSectionKeyword(section.metadata.id, id)

      case tag: Tag => tag.id == id

      case combiner: TagCombiner =>
        combiner.leftTag.id == id || combiner.rightTag.id == id

      case _ => false
    }

  def isFootballTeam: Boolean =
    page match {
      case tag: Tag => tag.isFootballTeam
      case _        => false
    }

  def forcesDayView: Boolean =
    page match {
      case tag: Tag if tag.metadata.sectionId == "crosswords" => false
      case tag: Tag                                           => Set("Series", "Blog").contains(tag.properties.tagType)
      case _                                                  => false
    }

  def idWithoutEdition: String =
    page match {
      case section: Section if section.isEditionalised => Paths.stripEditionIfPresent(section.metadata.id)
      case other                                       => other.metadata.id
    }

  def allPath: String = s"/$idWithoutEdition"

  def branding(edition: Edition): Option[Branding] = page.metadata.commercial.flatMap(_.branding(edition))
}
