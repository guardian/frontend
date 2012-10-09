package common

import play.api.mvc.RequestHeader

case class SectionLink(zone: String, linkName: String, href: String, title: String)

object Navigation {
  def apply(request: RequestHeader, config: GuardianConfiguration) = {

    val host = request.headers.get("host")
    val edition = config.edition(host)

    val sportTitle = if (edition == "US") "Sports" else "Sport"

    val sections = Seq(
      SectionLink("home", "Home", "/", "Home"),
      SectionLink("uk", "UK News", "/uk", "UK news"),
      SectionLink("world", "World News", "/world", "World news"),
      SectionLink("sport", "Sport", "/sport", sportTitle),
      SectionLink("football", "Football", "/football", "Football"),
      SectionLink("commentisfree", "Comment is free", "/commentisfree", "Comment is free"),
      SectionLink("lifeandstyle", "Life & Style", "/lifeandstyle", "Life &amp; style"),
      SectionLink("culture", "Culture", "/culture", "Culture"),
      SectionLink("business", "Business", "/business", "Business"),
      SectionLink("technology", "Technology", "/technology", "Technology"),
      SectionLink("film", "Film", "/film", "Film"),
      SectionLink("music", "Music", "/music", "Music")
    )

    sections
  }
}
