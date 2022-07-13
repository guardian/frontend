package layout

import common.Pagination
import model.{ApplicationContext, Page, Section, Tag}
import services.ConfigAgent

sealed trait FaciaContainerHeader

case class MetaDataHeader(
    displayName: String,
    image: Option[FaciaHeaderImage],
    description: Option[String],
    dateHeadline: DateHeadline,
    href: Option[String],
) extends FaciaContainerHeader

case class LoneDateHeadline(get: DateHeadline) extends FaciaContainerHeader

case class DescriptionMetaHeader(description: String) extends FaciaContainerHeader

object FaciaContainerHeader {
  def fromSection(sectionPage: Section, dateHeadline: DateHeadline)(implicit
      context: ApplicationContext,
  ): FaciaContainerHeader =
    MetaDataHeader(
      sectionPage.metadata.webTitle,
      None,
      sectionPage.metadata.description,
      dateHeadline,
      frontHref(sectionPage.metadata.id, sectionPage.metadata.pagination),
    )

  def fromPage(page: Page, dateHeadline: DateHeadline)(implicit context: ApplicationContext): FaciaContainerHeader = {
    MetaDataHeader(
      page.metadata.webTitle,
      None,
      None,
      dateHeadline,
      frontHref(page.metadata.id, page.metadata.pagination),
    )
  }

  def fromTagPage(tagPage: Tag, dateHeadline: DateHeadline)(implicit
      context: ApplicationContext,
  ): FaciaContainerHeader = {
    if (tagPage.isFootballTeam) {
      MetaDataHeader(
        tagPage.metadata.webTitle,
        tagPage.properties.footballBadgeUrl.map(FaciaHeaderImage(_, FootballBadge)),
        tagPage.metadata.description,
        dateHeadline,
        frontHref(tagPage.id, tagPage.metadata.pagination),
      )
    } else if (tagPage.isContributor) {
      MetaDataHeader(
        tagPage.metadata.webTitle,
        tagPage.contributorImagePath.map(FaciaHeaderImage(_, ContributorCircleImage)),
        tagPage.properties.bio.filter(_.nonEmpty) orElse tagPage.metadata.description,
        dateHeadline,
        frontHref(tagPage.id, tagPage.metadata.pagination),
      )
    } else {
      MetaDataHeader(
        tagPage.metadata.webTitle,
        None,
        tagPage.metadata.description,
        dateHeadline,
        frontHref(tagPage.id, tagPage.metadata.pagination),
      )
    }
  }

  /** Want to show a link to the front if it exists, or to the first page of the tag page if we're not on that page */
  private def frontHref(id: String, pagination: Option[Pagination])(implicit context: ApplicationContext) =
    if (ConfigAgent.shouldServeFront(id) || pagination.exists(_.currentPage > 1)) {
      Some(s"/$id")
    } else {
      None
    }
}
