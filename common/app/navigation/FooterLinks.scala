package navigation

import common.{Edition, editions}

case class FooterLink(
    text: String,
    url: String,
    dataLinkName: String,
    extraClasses: String = "",
)

object FooterLinks {

  // Footer column one

  val complaintsAndCorrections =
    FooterLink("Complaints & corrections", "/info/complaints-and-corrections", "complaints")
  val secureDrop = FooterLink("SecureDrop", "https://www.theguardian.com/securedrop", "securedrop")
  val privacyPolicy = FooterLink("Privacy policy", "/info/privacy", "privacy")
  val cookiePolicy = FooterLink("Cookie policy", "/info/cookies", "cookie")
  val termsAndConditions = FooterLink("Terms & conditions", "/help/terms-of-service", "terms")

  def help(edition: String): FooterLink =
    FooterLink("Help", "/help", s"${edition} : footer : tech feedback", "js-tech-feedback-report")
  def workForUs(edition: String): FooterLink =
    FooterLink("Work for us", "https://workforus.theguardian.com", s"${edition} : footer : work for us")

  val ukListOne = List(
    FooterLink("About us", "/about", "uk : footer : about us"),
    FooterLink("Contact us", "/help/contact-us", "uk : footer : contact us"),
    complaintsAndCorrections,
    secureDrop,
    workForUs("uk"),
    privacyPolicy,
    cookiePolicy,
    termsAndConditions,
    help("uk"),
  )

  val usListOne = List(
    FooterLink("About us", "/info/about-guardian-us", "us : footer : about us"),
    FooterLink("Contact us", "/info/about-guardian-us/contact", "us : footer : contact us"),
    complaintsAndCorrections,
    secureDrop,
    workForUs("us"),
    privacyPolicy,
    cookiePolicy,
    termsAndConditions,
    help("us"),
  )

  val auListOne = List(
    FooterLink("About us", "/info/about-guardian-australia", "au : footer : about us"),
    FooterLink("Information", "/info", "au : footer : information"),
    complaintsAndCorrections,
    FooterLink("Contact us", "/info/2013/may/26/contact-guardian-australia", "au : footer : contact us"),
    secureDrop,
    FooterLink(
      "Vacancies",
      "https://www.theguardian.com/info/2015/aug/04/guardian-australia-job-vacancies",
      "au : footer : vacancies",
    ),
    privacyPolicy,
    termsAndConditions,
    help("au"),
  )

  val intListOne = List(
    FooterLink("Contact us", "/help/contact-us", "international : footer : contact us"),
    complaintsAndCorrections,
    secureDrop,
    workForUs("international"),
    privacyPolicy,
    cookiePolicy,
    termsAndConditions,
    help("international"),
  )

  // Footer column two

  def allTopics(edition: String): FooterLink =
    FooterLink("All topics", "/index/subjects/a", s"${edition} : footer : all topics")
  def allWriters(edition: String): FooterLink =
    FooterLink("All writers", "/index/contributors", s"${edition} : footer : all contributors")
  val digitalNewspaperArchive: FooterLink =
    FooterLink("Digital newspaper archive", "https://theguardian.newspapers.com", "digital newspaper archive")
  def facebook(edition: String): FooterLink =
    FooterLink("Facebook", "https://www.facebook.com/theguardian", s"${edition} : footer : facebook")
  def youtube(edition: String): FooterLink =
    FooterLink("YouTube", "https://www.youtube.com/user/TheGuardian", s"${edition} : footer : youtube")
  def linkedin(edition: String): FooterLink =
    FooterLink("LinkedIn", "https://www.linkedin.com/company/theguardian", s"${edition} : footer : linkedin")
  def instagram(edition: String): FooterLink =
    FooterLink("Instagram", "https://www.instagram.com/guardian", s"${edition} : footer : instagram")
  def twitter(edition: String): FooterLink =
    FooterLink("Twitter", "https://twitter.com/guardian", s"${edition}: footer : twitter")
  def newsletters(edition: String): FooterLink =
    FooterLink(
      text = "Newsletters",
      url = s"/email-newsletters?INTCMP=DOTCOM_FOOTER_NEWSLETTER_${edition.toUpperCase}",
      dataLinkName = s"$edition : footer : newsletters",
    )

  val ukListTwo = List(
    allTopics("uk"),
    allWriters("uk"),
    FooterLink(
      "Modern Slavery Act",
      "https://uploads.guim.co.uk/2022/07/20/STL_Modern_Slavery_Statement_2022.pdf",
      "uk : footer : modern slavery act statement",
    ),
    digitalNewspaperArchive,
    facebook("uk"),
    youtube("uk"),
    instagram("uk"),
    linkedin("uk"),
    twitter("uk"),
    newsletters("uk"),
  )

  val usListTwo = List(
    allTopics("us"),
    allWriters("us"),
    digitalNewspaperArchive,
    facebook("us"),
    youtube("us"),
    instagram("us"),
    linkedin("us"),
    twitter("us"),
    newsletters("us"),
  )

  val auListTwo = List(
    allTopics("au"),
    allWriters("au"),
    FooterLink("Events", "/guardian-masterclasses/guardian-masterclasses-australia", "au : footer : masterclasses"),
    digitalNewspaperArchive,
    facebook("au"),
    youtube("au"),
    instagram("au"),
    linkedin("au"),
    twitter("au"),
    newsletters("au"),
  )

  val intListTwo = List(
    allTopics("international"),
    allWriters("international"),
    digitalNewspaperArchive,
    facebook("international"),
    youtube("international"),
    instagram("international"),
    linkedin("international"),
    twitter("international"),
    newsletters("international"),
  )

  // Footer column three

  val ukListThree = List(
    FooterLink("Advertise with us", "https://advertising.theguardian.com", "uk : footer : advertise with us"),
    FooterLink("Guardian Labs", "/guardian-labs", "uk : footer : guardian labs"),
    FooterLink("Search jobs", "https://jobs.theguardian.com?INTCMP=NGW_FOOTER_UK_GU_JOBS", "uk : footer : jobs"),
    FooterLink("Patrons", "https://patrons.theguardian.com?INTCMP=footer_patrons", "uk : footer : patrons"),
  )

  val usListThree = List(
    FooterLink(
      "Advertise with us",
      "https://advertising.theguardian.com/us/advertising",
      "us : footer : advertise with us",
    ),
    FooterLink("Guardian Labs", "/guardian-labs-us", "us : footer : guardian labs"),
    FooterLink("Search jobs", "https://jobs.theguardian.com?INTCMP=NGW_FOOTER_US_GU_JOBS", "us : footer : jobs"),
  )

  val auListThree = List(
    FooterLink("Guardian Labs", "/guardian-labs-australia", "au : footer : guardian labs"),
    FooterLink("Advertise with us", "https://advertising.theguardian.com/", "au : footer : advertise with us"),
    cookiePolicy,
  )

  val intListThree = List(
    FooterLink(
      "Advertise with us",
      "https://advertising.theguardian.com",
      "international : footer : advertise with us",
    ),
    FooterLink(
      "Search UK jobs",
      "https://jobs.theguardian.com/?INTCMP=NGW_FOOTER_INT_GU_JOBS",
      "international : footer : uk-jobs",
    ),
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
