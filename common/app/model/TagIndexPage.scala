package model

import com.gu.openplatform.contentapi.model.{Tag => ApiTag}
import common.{Maps, HTML}
import play.api.libs.json._

object SectionDefinition {
  implicit val jsonFormat = Json.format[SectionDefinition]
}

case class SectionDefinition(
  name: String,
  id: String
)

object TagDefinition {
  implicit val jsonFormat = Json.format[TagDefinition]

  def fromContentApiTag(apiTag: ApiTag): TagDefinition = TagDefinition(
    apiTag.webTitle,
    apiTag.id,
    for {
      name <- apiTag.sectionName
      id <- apiTag.sectionId
    } yield SectionDefinition(name, id),
    new Tag(apiTag).isSectionTag
  )

  object / {
    val Matcher = """^([^/]+)/(.*)$""".r

    def unapply(s: String): Option[(String, String)] = s match {
      case Matcher(before, after) => Some((before, after))
      case _ => None
    }
  }
}

/** Minimal amount of information we need to serialize about tags */
case class TagDefinition(
  webTitle: String,
  id: String,
  sectionDefinition: Option[SectionDefinition],
  isSectionTag: Boolean
) {
  import TagDefinition./

  def tagTypeName: Option[String] = {
    sectionDefinition.map(section => HTML.noHtml(section.name)) orElse ({
      case "profile" / _ => "Contributor"
      case "type" / _ => "Content type"
      case "tone" / _ => "Tone"
      case "global/series/getting-onto-graduate-schemes" => "Careers"
      case "global/series/gw-good-to-meet-you" | "global/series/gw-letters" => "Guardian Weekly"
      case "publication/guardianweekly" => "Publication"
    }: PartialFunction[String, String]).lift(id)
  }

  def indexPath = "/" + ((for {
    s <- sectionDefinition if isSectionTag
  } yield s.id) getOrElse id)
}

object TagIndexListing {
  implicit val jsonFormat = Json.format[TagIndexListing]

  def fromTagIndexPage(tagIndexPage: TagIndexPage) =
    TagIndexListing(tagIndexPage.id, tagIndexPage.title)
}

case class TagIndexListing(
  id: String,
  title: String
)

object TagIndexListings {
  implicit val jsonFormat = Json.format[TagIndexListings]

  def fromTagIndexPages(pages: Seq[TagIndexPage]) =
    TagIndexListings(pages.map(TagIndexListing.fromTagIndexPage).sortBy(_.title))
}

case class TagIndexListings(pages: Seq[TagIndexListing])

object TagIndexPage {
  implicit val jsonFormat = Json.format[TagIndexPage]
}

case class TagIndexPage(
  id: String,
  title: String,
  tags: Seq[TagDefinition]
) {
  lazy val countsByWebTitle = tags.foldLeft(Map.empty[String, Int]) { (acc, tag) =>
    Maps.insertWith(acc, tag.webTitle, 1) { _ + _ }
  }

  def hasDuplicateWebTitle(tagDefiniton: TagDefinition) =
    countsByWebTitle.get(tagDefiniton.webTitle).exists(_ > 1)

  def indexTitle(tagDefinition: TagDefinition) =
    tagDefinition.webTitle + (if (hasDuplicateWebTitle(tagDefinition))
      tagDefinition.tagTypeName.map(", " + _).getOrElse("")
    else "")
}
