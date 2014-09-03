package views.helpers

import model.Tag

object ApplicationsTemplateHelper {

  object head {

    def openGraphDescription(tag: Tag): Option[String] = tag match {
        case _ if tag.bio.nonEmpty => Some(tag.bio)
        case _ => tag.description
      }

    def openGraphImage(tag: Tag): String =
      tag.contributorImagePath.getOrElse("//static-secure.guim.co.uk/icons/social/og/gu-logo-fallback.png")
  }

}
