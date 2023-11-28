package staticpages

import model.{DotcomContentType, MetaData, SectionId, SimplePage, StandalonePage}
import services.newsletters.model.NewsletterResponse
import services.newsletters.model.NewsletterResponseV2

case class NewsletterRoundupPage(
    metadata: MetaData,
    groupedNewsletterResponses: List[(String, List[NewsletterResponse])],
) extends StandalonePage {
  val groupedNewslettersResponses = groupedNewsletterResponses
}

object StaticPages {
  def simpleSurveyStaticPageForId(id: String): SimplePage =
    SimplePage(
      MetaData.make(
        id = id,
        section = Option(SectionId(value = "global")),
        webTitle = "Guardian Survey Page",
        contentType = Some(DotcomContentType.Survey),
        iosType = None,
        shouldGoogleIndex = false,
      ),
    )

  def simpleNewslettersPage(
      id: String,
      groupedNewsletterResponses: List[(String, List[NewsletterResponse])],
  ): NewsletterRoundupPage =
    NewsletterRoundupPage(
      MetaData.make(
        id = id,
        section = Option(SectionId(value = "newsletter-signup-page")),
        webTitle = "Guardian newsletters: Sign up for our free newsletters",
        description = Some(
          "Scroll less and understand more about the subjects you care about with the Guardian's brilliant email newsletters, free to your inbox.",
        ),
        contentType = Some(DotcomContentType.Signup),
        iosType = None,
        shouldGoogleIndex = true,
      ),
      groupedNewsletterResponses,
    )

  def dcrSimpleNewsletterPage(
      id: String,
  ): SimplePage =
    SimplePage(
      MetaData.make(
        id = id,
        section = Option(SectionId(value = "newsletter-signup-page")),
        webTitle = "Guardian newsletters: Sign up for our free newsletters",
        description = Some(
          "Scroll less and understand more about the subjects you care about with the Guardian's brilliant email newsletters, free to your inbox.",
        ),
        contentType = Some(DotcomContentType.Signup),
        iosType = None,
        shouldGoogleIndex = true,
      ),
    )


  private def getSectionForNewsletter ( newsletter: NewsletterResponseV2): SectionId = {

    val fallback = SectionId(value = "global")
    // TO DO - could use regionFocus to look up an Edition object - maybe the sectionId can be derived using that?
    newsletter.theme match {
      case "news" =>  newsletter.regionFocus match {
        case None => fallback
        case Some(edition) => edition match {
          case "UK" => SectionId(value = "uk")
          case "AU" => SectionId(value = "australia-news")
          case "US" => SectionId(value = "us-news")
          case "EUR" => SectionId(value = "world/europe-news")
          case _ => fallback
        }
      }
      case "sport" => SectionId(value = "sport")
      case "opinion" => SectionId(value = "commentisfree")
      case "lifestyle" => SectionId(value = "lifeandstyle")
      case "features" => fallback
      case "culture" => SectionId(value = "culture")
      case _ => fallback
    }
  }

  def dcrSimpleNewsletterDetailPage(
      id: String,
      newsletter: NewsletterResponseV2,
  ): SimplePage =
    SimplePage(
      MetaData.make(
        id = id,
        section = Some(getSectionForNewsletter(newsletter)),
        webTitle = s"Guardian newsletters: ${newsletter.name}",
        description = Some(
          newsletter.signUpDescription,
        ),
        contentType = Some(DotcomContentType.Signup),
        iosType = None,
        shouldGoogleIndex = true,
      ),
    )
}
