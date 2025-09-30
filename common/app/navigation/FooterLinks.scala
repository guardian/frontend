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


  /* Column one */

  val ukListOne = List(
    FooterLink("About us", "/about", "uk : footer : about us"),
    help("uk"),
    complaintsAndCorrections,
    secureDrop,
    workForUs("uk"),
    privacyPolicy,
    cookiePolicy,
    termsAndConditions,
    FooterLink("Contact us", "/help/contact-us", "uk : footer : contact us"),
  )

  val usListOne = List(
    FooterLink("About us", "/info/about-guardian-us", "us : footer : about us"),
    help("us"),
    complaintsAndCorrections,
    secureDrop,
    workForUs("us"),
    privacyPolicy,
    cookiePolicy,
    termsAndConditions,
    FooterLink("Contact us", "/info/about-guardian-us/contact", "us : footer : contact us"),
  )

  val auListOne = List(
    FooterLink("About us", "/info/about-guardian-australia", "au : footer : about us"),
    FooterLink("Information", "/info", "au : footer : information"),
    complaintsAndCorrections,
    help("au"),
    secureDrop,
    workForUs("australia"),
    privacyPolicy,
    termsAndConditions,
    FooterLink("Contact us", "/info/2013/may/26/contact-guardian-australia", "au : footer : contact us"),
  )

  val intListOne = List(
    help("international"),
    complaintsAndCorrections,
    secureDrop,
    workForUs("international"),
    privacyPolicy,
    cookiePolicy,
    termsAndConditions,
    FooterLink("Contact us", "/help/contact-us", "international : footer : contact us"),
  )

  /* Column two */
  val ukListTwo = List(
    allTopics("uk"),
    allWriters("uk"),
    FooterLink(
      "Modern Slavery Act",
      "https://uploads.guim.co.uk/2025/09/05/Modern_Slavery_Statement_2025.pdf",
      "uk : footer : modern slavery act statement",
    ),
    taxStrategy("uk"),
    digitalNewspaperArchive,
    facebook("uk"),
    youtube("uk"),
    instagram("uk"),
    linkedin("uk"),
    newsletters("uk"),
  )

  val usListTwo = List(
    allTopics("us"),
    allWriters("us"),
    digitalNewspaperArchive,
    taxStrategy("us"),
    facebook("us"),
    youtube("us"),
    instagram("us"),
    linkedin("us"),
    newsletters("us"),
  )

  val auListTwo = List(
    allTopics("au"),
    allWriters("au"),
    digitalNewspaperArchive,
    taxStrategy("au"),
    facebook("au"),
    youtube("au"),
    instagram("au"),
    linkedin("au"),
    newsletters("au"),
  )

  val intListTwo = List(
    allTopics("international"),
    allWriters("international"),
    digitalNewspaperArchive,
    taxStrategy("international"),
    facebook("international"),
    youtube("international"),
    instagram("international"),
    linkedin("international"),
    newsletters("international"),
  )

  /* Column three */

  val ukListThree = List(
    FooterLink("Advertise with us", "https://advertising.theguardian.com", "uk : footer : advertise with us"),
    FooterLink("Guardian Labs", "/guardian-labs", "uk : footer : guardian labs"),
    FooterLink("Search jobs", "https://jobs.theguardian.com", "uk : footer : jobs"),
    FooterLink("Patrons", "https://patrons.theguardian.com?INTCMP=footer_patrons", "uk : footer : patrons"),
    FooterLink("Tips", "https://www.theguardian.com/tips", "uk : footer : tips"),
    accessibilitySettings,
  )

  val usListThree = List(
    FooterLink(
      "Advertise with us",
      "https://usadvertising.theguardian.com",
      "us : footer : advertise with us",
    ),
    FooterLink("Guardian Labs", "/guardian-labs-us", "us : footer : guardian labs"),
    FooterLink("Search jobs", "https://jobs.theguardian.com", "us : footer : jobs"),
    FooterLink("Tips", "https://www.theguardian.com/tips", "us : footer : tips"),
    accessibilitySettings,
  )

  val auListThree = List(
    FooterLink("Guardian Labs", "/guardian-labs-australia", "au : footer : guardian labs"),
    FooterLink(
      "Advertise with us",
      "https://ausadvertising.theguardian.com/",
      "au : footer : advertise with us",
    ),
    cookiePolicy,
    FooterLink("Tips", "https://www.theguardian.com/tips", "au : footer : tips"),
    accessibilitySettings,
  )

  val intListThree = List(
    FooterLink(
      "Advertise with us",
      "https://advertising.theguardian.com",
      "international : footer : advertise with us",
    ),
    FooterLink(
      "Search UK jobs",
      "https://jobs.theguardian.com",
      "international : footer : uk-jobs",
    ),
    FooterLink("Tips", "https://www.theguardian.com/tips", "int : footer : tips"),
    accessibilitySettings,
  )

  def getFooterByEdition(edition: Edition): Seq[Seq[FooterLink]] =
    edition match {
      case editions.Uk            => Seq(ukListOne, ukListTwo, ukListThree)
      case editions.Us            => Seq(usListOne, usListTwo, usListThree)
      case editions.Au            => Seq(auListOne, auListTwo, auListThree)
      case editions.International => Seq(intListOne, intListTwo, intListThree)
      case _                      => Seq(intListOne, intListTwo, intListThree)
    }

}
