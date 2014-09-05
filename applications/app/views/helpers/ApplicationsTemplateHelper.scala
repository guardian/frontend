package views.helpers

import model.Tag

object ApplicationsTemplateHelper {

  object head {

    def openGraphDescription(tag: Tag): Option[String] =
      if (tag.bio.nonEmpty) Some(tag.bio) else tag.description

    def openGraphImage(tag: Tag): String =
      tag.sharingImagePath.getOrElse("http://static.guim.co.uk/icons/social/og/gu-logo-fallback.png")
  }

}
