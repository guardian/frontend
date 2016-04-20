package indexes

import common.Logging
import common.Maps._
import com.gu.contentapi.client.model.v1.Tag
import model.{TagDefinition, TagIndexPage}
import common.StringEncodings.asAscii

import play.api.libs.iteratee.{Enumeratee, Iteratee}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Try

object TagPages extends Logging {
  /** To be curated by Peter Martin */
  val ValidSections = Map(
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
    ("world", "World news")
  )

  val Publications = Map(
    ("theguardian", "The Guardian"),
    ("theobserver", "The Observer")
  )

  def alphaIndexKey(s: String) = {
    val badCharacters = """[^a-z0-9]+""".r

    val maybeFirstChar = Try(badCharacters.replaceAllIn(asAscii(s).toLowerCase, "").charAt(0)).toOption

    if (maybeFirstChar.isEmpty) {
      log.error(s"Tag without alpha index, being shoved into 1-9: $s")
    }

    maybeFirstChar.filterNot(_.isDigit).map(_.toString).getOrElse("1-9")
  }

  def tagHeadKey(id: String) = {
    id.split("/").headOption
  }

  private def mappedByKey(key: Tag => String) =
    Iteratee.fold[Tag, Map[String, Set[Tag]]](Map.empty) { (acc, tag) =>
      insertWith(acc, key(tag), Set(tag))(_ union _)
    }

  def asciiLowerWebTitle(tag: Tag) =
    asAscii(tag.webTitle).toLowerCase

  def nameOrder(tag: Tag) =
    (tag.lastName, tag.firstName, tag.webTitle)

  def toPages[A: Ordering](tagsByKey: Map[String, Set[Tag]])
                          (titleFromKey: String => String, sortKey: Tag => A) =
    tagsByKey.toSeq.sortBy(_._1) map { case (id, tagSet) =>
      TagIndexPage(
        id,
        titleFromKey(id),
        tagSet.toSeq.sortBy(sortKey).map(TagDefinition.fromContentApiTag)
      )
    }

  val invalidSectionsFilter = Enumeratee.filter[Tag](_.sectionId.exists(ValidSections.contains))
  val publicationsFilter = Enumeratee.filter[Tag](t => tagHeadKey(t.id).exists(Publications.contains))

  val byWebTitle = mappedByKey(tag => alphaIndexKey(tag.webTitle))

  val byContributorNameOrder = mappedByKey { tag =>
    alphaIndexKey(tag.lastName orElse tag.firstName getOrElse tag.webTitle)
  }

  val bySection = invalidSectionsFilter &>> mappedByKey(_.sectionId.get)

  val byPublication = publicationsFilter &>> mappedByKey(tag => tagHeadKey(tag.id).getOrElse("publication"))

}

