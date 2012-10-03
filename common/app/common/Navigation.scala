package common

import play.api.mvc.RequestHeader

case class Section(zone: String, linkName: String, href: String, title: String)

object Navigation {
  def apply(request: RequestHeader, config: GuardianConfiguration) = {

    val host = request.headers.get("host")
    val edition = config.edition(host)

    val sportTitle = if (edition == "US") "Sports" else "Sport"

    val sections = Seq(
      Section("uk", "UK News", "/uk", "UK news"),
      Section("world", "World News", "/world", "World news"),
      Section("sport", "Sport", "/sport", sportTitle),
      Section("football", "Football", "/football", "Football"),
      Section("commentisfree", "Comment is free", "/commentisfree", "Comment is free"),
      Section("lifeandstyle", "Life & Style", "/lifeandstyle", "Life &amp; style"),
      Section("culture", "Culture", "/culture", "Culture"),
      Section("business", "Business", "/business", "Business"),
      Section("technology", "Technology", "/technology", "Technology"),
      Section("film", "Film", "/film", "Film"),
      Section("music", "Music", "/music", "Music")
    )

    sections
  }
}
