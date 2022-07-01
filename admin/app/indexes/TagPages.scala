package indexes

import com.gu.contentapi.client.model.v1.Tag
import common.GuLogging
import common.StringEncodings.asAscii
import model.{TagDefinition, TagIndex}

import scala.concurrent.ExecutionContext
import scala.util.Try

object TagPages {

  /** To be curated by Peter Martin */
  val validSections = Map(
    ("artanddesign", "Art and design"),
    ("better-business", "Better Business"),
    ("books", "Books"),
    ("business", "Business"),
    ("cardiff", "Cardiff"),
    ("cities", "Cities"),
    ("commentisfree", "Comment is free"),
    ("community", "Community"),
    ("crosswords", "Crosswords"),
    ("culture", "Culture"),
    ("culture-network", "Culture Network"),
    ("culture-professionals-network", "Culture professionals network"),
    ("edinburgh", "Edinburgh"),
    ("education", "Education"),
    ("enterprise-network", "Guardian Enterprise Network"),
    ("environment", "Environment"),
    ("extra", "Extra"),
    ("fashion", "Fashion"),
    ("film", "Film"),
    ("football", "Football"),
    ("global-development", "Global development"),
    ("global-development-professionals-network", "Global Development Professionals Network"),
    ("government-computing-network", "Guardian Government Computing"),
    ("guardian-professional", "Guardian Professional"),
    ("healthcare-network", "Healthcare Professionals Network"),
    ("help", "Help"),
    ("higher-education-network", "Higher Education Network"),
    ("housing-network", "Housing Network"),
    ("info", "Info"),
    ("katine", "Katine"),
    ("law", "Law"),
    ("leeds", "Leeds"),
    ("lifeandstyle", "Life and style"),
    ("local", "Local"),
    ("local-government-network", "Local Leaders Network"),
    ("media", "Media"),
    ("media-network", "Media Network"),
    ("money", "Money"),
    ("music", "Music"),
    ("news", "News"),
    ("politics", "Politics"),
    ("public-leaders-network", "Public Leaders Network"),
    ("science", "Science"),
    ("search", "Search"),
    ("small-business-network", "Guardian Small Business Network"),
    ("social-care-network", "Social Care Network"),
    ("social-enterprise-network", "Social Enterprise Network"),
    ("society", "Society"),
    ("society-professionals", "Society Professionals"),
    ("sport", "Sport"),
    ("stage", "Stage"),
    ("teacher-network", "Teacher Network"),
    ("technology", "Technology"),
    ("theguardian", "From the Guardian"),
    ("theobserver", "From the Observer"),
    ("travel", "Travel"),
    ("travel/offers", "Guardian holiday offers"),
    ("tv-and-radio", "Television & radio"),
    ("uk-news", "UK news"),
    ("voluntary-sector-network", "Voluntary Sector Network"),
    ("weather", "Weather"),
    ("women-in-leadership", "Women in Leadership"),
    ("world", "World news"),
  )

  val publications = Map(
    ("theguardian", "The Guardian"),
    ("theobserver", "The Observer"),
  )
}

class TagPages(implicit executionContext: ExecutionContext) extends GuLogging {

  def alphaIndexKey(s: String): String = {
    val badCharacters = """[^a-z0-9]+""".r

    val maybeFirstChar = Try(badCharacters.replaceAllIn(asAscii(s).toLowerCase, "").charAt(0)).toOption

    if (maybeFirstChar.isEmpty) {
      log.error(s"Tag without alpha index, being shoved into 1-9: $s")
    }

    maybeFirstChar.filterNot(_.isDigit).map(_.toString).getOrElse("1-9")
  }

  def tagHeadKey(id: String): Option[String] = {
    id.split("/").headOption
  }

//  private def mappedByKey(key: Tag => String) =
//    Iteratee.fold[Tag, Map[String, Set[Tag]]](Map.empty) { (acc, tag) =>
//      insertWith(acc, key(tag), Set(tag))(_ union _)
//    }

  def asciiLowerWebTitle(tag: Tag): String =
    asAscii(tag.webTitle).toLowerCase

  def nameOrder(tag: Tag): (Option[String], Option[String], String) =
    (tag.lastName, tag.firstName, tag.webTitle)

  def toPages[A: Ordering](
      tagsByKey: Map[String, Set[Tag]],
  )(titleFromKey: String => String, sortKey: Tag => A): Seq[TagIndex] =
    tagsByKey.toSeq.sortBy(_._1) map {
      case (id, tagSet) =>
        TagIndex(
          id,
          titleFromKey(id),
          tagSet.toSeq.sortBy(sortKey).map(TagDefinition.fromContentApiTag),
        )
    }

  def invalidSectionsFilter(tag: Tag): Boolean = tag.sectionId.exists(TagPages.validSections.contains)
  def publicationsFilter(tag: Tag): Boolean = tagHeadKey(tag.id).exists(TagPages.publications.contains)

//  val byWebTitle = mappedByKey(tag => alphaIndexKey(tag.webTitle))
//
//  val byContributorNameOrder = mappedByKey { tag =>
//    alphaIndexKey(tag.lastName orElse tag.firstName getOrElse tag.webTitle)
//  }
//
//  val bySection = invalidSectionsFilter &>> mappedByKey(_.sectionId.get)
//
//  val byPublication = publicationsFilter &>> mappedByKey(tag => tagHeadKey(tag.id).getOrElse("publication"))

}
