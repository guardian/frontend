package navigation

import common.{Edition, editions}

case class FooterLink(
    text: String,
    url: String,
    dataLinkName: String,
    extraClasses: String = "",
)

object FooterLinks {

  // Helpers
  val complaintsAndCorrections =
    FooterLink("Complaints & corrections", "/info/complaints-and-corrections", "complaints")
  val secureDrop = FooterLink("SecureDrop", "https://www.theguardian.com/securedrop", "securedrop")
  val privacyPolicy = FooterLink("Privacy policy", "/info/privacy", "privacy")
  val cookiePolicy = FooterLink("Cookie policy", "/info/cookies", "cookie")
  val termsAndConditions = FooterLink("Terms & conditions", "/help/terms-of-service", "terms")
  val accessibilitySettings = FooterLink(
    "Accessibility settings",
    "/help/accessibility-help",
    "accessibility settings",
  )

  def help(edition: String): FooterLink =
    FooterLink(
      "Help",
      "https://manage.theguardian.com/help-centre",
      s"${edition} : footer : tech feedback",
      "js-tech-feedback-report",
    )
  def workForUs(edition: String): FooterLink =
    FooterLink("Work for us", "https://workforus.theguardian.com", s"${edition} : footer : work for us")
  def allTopics(edition: String): FooterLink =
    FooterLink("All topics", "/index/subjects/a", s"${edition} : footer : all topics")
  def allWriters(edition: String): FooterLink =
    FooterLink("All writers", "/index/contributors", s"${edition} : footer : all contributors")
  val digitalNewspaperArchive: FooterLink =
    FooterLink("Digital newspaper archive", "https://theguardian.newspapers.com", "digital newspaper archive")
  def taxStrategy(edition: String): FooterLink =
    FooterLink(
      "Tax strategy",
      "https://uploads.guim.co.uk/2025/09/05/Tax_strategy_for_the_year_ended_31_March_2025.pdf",
      s"${edition} : footer : tax strategy",
    )
  def facebook(edition: String): FooterLink =
    FooterLink("Facebook", "https://www.facebook.com/theguardian", s"${edition} : footer : facebook")
  def youtube(edition: String): FooterLink =
    FooterLink("YouTube", "https://www.youtube.com/user/TheGuardian", s"${edition} : footer : youtube")
  def linkedin(edition: String): FooterLink =
    FooterLink("LinkedIn", "https://www.linkedin.com/company/theguardian", s"${edition} : footer : linkedin")
  def instagram(edition: String): FooterLink =
    FooterLink("Instagram", "https://www.instagram.com/guardian", s"${edition} : footer : instagram")
  def newsletters(edition: String): FooterLink = {
    FooterLink(
      text = "Newsletters",
      url = s"/email-newsletters?INTCMP=DOTCOM_FOOTER_NEWSLETTER_${edition.toUpperCase}",
      dataLinkName = s"$edition : footer : newsletters",
    )
  }

    def modernSlaveryActStatement(edition: String): FooterLink = {
      FooterLink(
        "Modern Slavery Act",
        "https://uploads.guim.co.uk/2025/09/05/Modern_Slavery_Statement_2025.pdf",
        s"$edition : footer : modern slavery act statement",
      )
    }

    def tipUsOff(edition: String): FooterLink = {
      FooterLink("Tip us off", "https://www.theguardian.com/tips", s"$edition : footer : tips")
    }

  def searchJobs(edition: String): FooterLink = {
    FooterLink("Search jobs", "https://jobs.theguardian.com", s"$edition : footer : jobs")
  }


    /* Column one */

    val ukListOne = List(
      FooterLink("About us", "/about", "uk : footer : about us"),
      help("uk"),
      complaintsAndCorrections,
      FooterLink("Contact us", "/help/contact-us", "uk : footer : contact us"),
      tipUsOff("uk"),
      secureDrop,
      privacyPolicy,
      cookiePolicy,
      modernSlaveryActStatement("uk"),
      taxStrategy("uk"),
      termsAndConditions,
    )

    val usListOne = List(
      FooterLink("About us", "/info/about-guardian-us", "us : footer : about us"),
      help("us"),
      complaintsAndCorrections,
      FooterLink("Contact us", "/info/about-guardian-us/contact", "us : footer : contact us"),
      tipUsOff("us"),
      secureDrop,
      privacyPolicy,
      cookiePolicy,
      taxStrategy("us"),
      termsAndConditions,
    )

    val auListOne = List(
      FooterLink("About us", "/info/about-guardian-australia", "au : footer : about us"),
      FooterLink("Information", "/info", "au : footer : information"),
      help("au"),
      complaintsAndCorrections,
      FooterLink("Contact us", "/info/2013/may/26/contact-guardian-australia", "au : footer : contact us"),
      tipUsOff("au"),
      secureDrop,
      privacyPolicy,
      cookiePolicy,
      taxStrategy("au"),
      termsAndConditions,
    )

    val intListOne = List(
      FooterLink("About us", "/about", "international : footer : about us"),
      help("international"),
      complaintsAndCorrections,
      FooterLink("Contact us", "/help/contact-us", "international : footer : contact us"),
      tipUsOff("international"),
      secureDrop,
      privacyPolicy,
      cookiePolicy,
      taxStrategy("international"),
      termsAndConditions,
    )

    /* Column two */
    val ukListTwo = List(
      allTopics("uk"),
      allWriters("uk"),
      newsletters("uk"),
      digitalNewspaperArchive,
      facebook("uk"),
      instagram("uk"),
      linkedin("uk"),
      youtube("uk"),
    )

    val usListTwo = List(
      allTopics("us"),
      allWriters("us"),
      newsletters("us"),
      digitalNewspaperArchive,
      facebook("us"),
      instagram("us"),
      linkedin("us"),
      youtube("us"),
    )

    val auListTwo = List(
      allTopics("au"),
      allWriters("au"),
      newsletters("au"),
      digitalNewspaperArchive,
      facebook("au"),
      instagram("au"),
      linkedin("au"),
      youtube("au"),
    )

    val intListTwo = List(
      allTopics("international"),
      allWriters("international"),
      newsletters("international"),
      digitalNewspaperArchive,
      facebook("international"),
      instagram("international"),
      linkedin("international"),
      youtube("international"),
    )

    /* Column three */

    val ukListThree = List(
      FooterLink("Advertise with us", "https://advertising.theguardian.com", "uk : footer : advertise with us"),
      FooterLink("Guardian Labs", "/guardian-labs", "uk : footer : guardian labs"),
      searchJobs("uk"),
      FooterLink("Patrons", "https://patrons.theguardian.com?INTCMP=footer_patrons", "uk : footer : patrons"),
      workForUs("uk"),
      accessibilitySettings,
    )

    val usListThree = List(
      FooterLink(
        "Advertise with us",
        "https://usadvertising.theguardian.com",
        "us : footer : advertise with us",
      ),
      FooterLink("Guardian Labs", "/guardian-labs-us", "us : footer : guardian labs"),
      searchJobs("us"),
      workForUs("us"),
      accessibilitySettings,
    )

    val auListThree = List(
      FooterLink(
        "Advertise with us",
        "https://ausadvertising.theguardian.com/",
        "au : footer : advertise with us",
      ),
      FooterLink("Guardian Labs", "/guardian-labs-australia", "au : footer : guardian labs"),
      workForUs("australia"),
      accessibilitySettings,
    )

    val intListThree = List(
      FooterLink(
        "Advertise with us",
        "https://advertising.theguardian.com",
        "international : footer : advertise with us",
      ),
      searchJobs("int"), // may need to be changed for a specific title
      FooterLink("Tips", "https://www.theguardian.com/tips", "int : footer : tips"),
      accessibilitySettings,
      workForUs("international"),
    )

    def getFooterByEdition(edition: Edition): Seq[Seq[FooterLink]] =
      edition match {
        case editions.Uk => Seq(ukListOne, ukListTwo, ukListThree)
        case editions.Us => Seq(usListOne, usListTwo, usListThree)
        case editions.Au => Seq(auListOne, auListTwo, auListThree)
        case editions.International => Seq(intListOne, intListTwo, intListThree)
        case _ => Seq(intListOne, intListTwo, intListThree)
      }
  }

