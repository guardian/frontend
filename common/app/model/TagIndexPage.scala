package model

import com.gu.contentapi.client.model.v1.{Tag => ApiTag}
import common.{Maps, HTML}
import common.Strings./
import play.api.libs.json._

object SectionDefinition {
  implicit val jsonFormat = Json.format[SectionDefinition]
}

case class SectionDefinition(
    name: String,
    id: String,
)

object TagDefinition {
  implicit val jsonFormat = Json.format[TagDefinition]

  def fromContentApiTag(apiTag: ApiTag): TagDefinition =
    TagDefinition(
      apiTag.webTitle,
      apiTag.id,
      for {
        name <- apiTag.sectionName
        id <- apiTag.sectionId
      } yield SectionDefinition(name, id),
      Tag.make(apiTag).isSectionTag,
    )
}

/** Minimal amount of information we need to serialize about tags */
case class TagDefinition(
    webTitle: String,
    id: String,
    sectionDefinition: Option[SectionDefinition],
    isSectionTag: Boolean,
) {
  def tagTypeName: Option[String] = {
    sectionDefinition.map(section => HTML.noHtml(section.name)) orElse ({
      case "profile" / _                                                    => "Contributor"
      case "type" / _                                                       => "Content type"
      case "tone" / _                                                       => "Tone"
      case "global/series/getting-onto-graduate-schemes"                    => "Careers"
      case "global/series/gw-good-to-meet-you" | "global/series/gw-letters" => "Guardian Weekly"
      case "publication/guardianweekly"                                     => "Publication"
    }: PartialFunction[String, String]).lift(id)
  }

  def indexPath: String =
    "/" + ((for {
      s <- sectionDefinition if isSectionTag
    } yield s.id) getOrElse id)
}

object TagIndexListing {
  implicit val jsonFormat = Json.format[TagIndexListing]

  def fromTagIndex(tagIndex: TagIndex): TagIndexListing =
    TagIndexListing(tagIndex.id, tagIndex.title)
}

case class TagIndexListing(
    id: String,
    title: String,
)

object TagIndexListings {
  implicit val jsonFormat = Json.format[TagIndexListings]

  def fromTagIndexPages(pages: Seq[TagIndex]): TagIndexListings =
    TagIndexListings(pages.map(TagIndexListing.fromTagIndex).sortBy(_.title))
}

case class TagIndexListings(pages: Seq[TagIndexListing])

object TagIndex {
  implicit val jsonFormat = Json.format[TagIndex]
}

case class TagIndex(
    id: String,
    title: String,
    tags: Seq[TagDefinition],
) {
  lazy val countsByWebTitle = tags.foldLeft(Map.empty[String, Int]) { (acc, tag) =>
    Maps.insertWith(acc, tag.webTitle, 1) { _ + _ }
  }

  def hasDuplicateWebTitle(tagDefinition: TagDefinition): Boolean =
    countsByWebTitle.get(tagDefinition.webTitle).exists(_ > 1)

  def indexTitle(tagDefinition: TagDefinition): String =
    tagDefinition.webTitle + (if (hasDuplicateWebTitle(tagDefinition))
                                tagDefinition.tagTypeName.map(", " + _).getOrElse("")
                              else "")
}

case class TagIndexPage(
    tagIndex: TagIndex,
    metadata: MetaData,
    title: String,
) extends StandalonePage
