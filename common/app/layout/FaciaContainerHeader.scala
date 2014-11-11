package layout

import model.Tag

object FaciaContainerHeader {
  def fromTagPage(tagPage: Tag): FaciaContainerHeader = {
    if (tagPage.isFootballTeam) {
      FootballTeamHeader(tagPage.webTitle, tagPage.url, tagPage.getFootballBadgeUrl, tagPage.description)
    } else if (tagPage.isContributor) {
      ContributorMetaDataHeader(
        tagPage.webTitle,
        tagPage.url,
        Some(tagPage.bio).filter(_.nonEmpty) orElse tagPage.description
      )
    } else {
      TagMetaDataHeader(tagPage.webTitle, tagPage.url, tagPage.description)
    }
  }
}

sealed trait FaciaContainerHeader

case class FootballTeamHeader(
  displayName: String,
  href: String,
  footballBadgeUrl: Option[String],
  description: Option[String]
) extends FaciaContainerHeader

case class TagMetaDataHeader(
  displayName: String,
  href: String,
  description: Option[String]
) extends FaciaContainerHeader

case class ContributorMetaDataHeader(
  displayName: String,
  href: String,
  description: Option[String]
) extends FaciaContainerHeader
