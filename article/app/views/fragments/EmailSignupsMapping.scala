package views.html.fragments

import model.Content
import common.Edition

case class MailingListDetails(id: Int, label: String, title: String, copyText: String, link: String)

object EmailSignupsMapping {

  val MailingLists = Map(
    ("art-weekly", MailingListDetails(id = 99, label = "Art Weekly", title = "Get the Guardian's Art Weekly email", copyText = "For your art world low-down, the latest news, reviews and comment delivered straight to your inbox.",link = "Sign up for the Art Weekly email")),
    ("australian-politics", MailingListDetails(id = 1866, label = "Daily email", title = "Get the Australian politics email", copyText = "All the latest news and comment on Australian politics, delivered to you every weekday.",link = "Sign up for the Australian politics email")),
    ("book-club", MailingListDetails(id = 131, label = "Guardian book club", title = "Get the Guardian book club email", copyText = "Hosted by John Mullan, be the first to find out about forthcoming events and featured authors.",link = "Sign up for the Guardian book club email")),
    ("close-up", MailingListDetails(id = 40, label = "Close up", title = "Sign up for the Close up email", copyText = "Every Thursday, rely on Close up to bring you Guardian film news, reviews and much, much more.",link = "Sign up for the Close up email")),
    ("crossword-update", MailingListDetails(id = 101, label = "Crossword editor's update", title = "Get the Crossword editor's email", copyText = "Register to receive our monthly crossword email with the latest issues and tips.",link = "Sign up for the Crossword editor's update")),
    ("daily-email", MailingListDetails(id = 37, label = "Daily email", title = "Sign up for the Guardian Today", copyText = "Our editors' picks for the day's top news and commentary delivered to your inbox each morning.",link = "Sign up for the daily email")),
    ("daily-email-us", MailingListDetails(id = 1493, label = "Daily email", title = "Get the Guardian's daily US email", copyText = "Our editors' picks for the day's top news and commentary delivered to your inbox each morning.",link = "Sign up for the daily email")),
    ("daily-email-au", MailingListDetails(id = 1506, label = "Daily email", title = "Get the Guardian's daily Australia email", copyText = "Our editors' picks for the day's top news and commentary delivered to your inbox every weekday.",link = "Sign up for the daily email")),
    ("fashion-statement", MailingListDetails(id = 105, label = "Fashion statement", title = "Sign up for the Fashion statement", copyText = "Get the latest news, views and shoes from the style frontline every Friday.",link = "Sign up for the Fashion statement email")),
    ("film-today", MailingListDetails(id = 1950, label = "Film Today", title = "Sign up for the Film Today email", copyText = "The top headlines each weekday delivered straight to your inbox in time for your evening commute.",link = "Sign up for the Film Today email")),
    ("green-light", MailingListDetails(id = 38, label = "Green light", title = "Sign up for the Green light email", copyText = "The most important environment stories each week including data, opinion pieces and guides.",link = "Sign up for the Green light email")),
    ("media-briefing", MailingListDetails(id = 217, label = "Media briefing", title = "Sign up for the Media briefing email", copyText = "An indispensable summary of what the papers are saying about media on your desktop before 9am.",link = "Sign up for the Media briefing email")),
    ("money-talks", MailingListDetails(id = 1079, label = "Money Talks", title = "Get the Guardian's Money Talks email", copyText = "Stay on top of the best personal finance and money news of the week from the Guardian Money editors.",link = "Sign up for the Money Talks email")),
    ("observer-monthly", MailingListDetails(id = 248, label = "The Observer Food Monthly", title = "Get the Observer Food Monthly email", copyText = "Sign up to the Observer Food Monthly for food and drink news, tips, offers, recipes and competitions.",link = "Sign up for the Observer Food Monthly email")),
    ("poverty-matters", MailingListDetails(id = 113, label = "Poverty matters", title = "Sign up for the Poverty matters email", copyText = "The most important debate and discussion from around the world delivered every fortnight.",link = "Sign up for the Poverty matters email")),
    ("society-briefing", MailingListDetails(id = 208, label = "Society briefing", title = "Sign up for the Society briefing email", copyText = "Stay on top of the latest policy announcements, legislation and keep ahead of current thinking.",link = "Sign up for the Society briefing email")),
    ("sleeve-notes", MailingListDetails(id = 39, label = "Sleeve notes", title = "Get the Guardian's Sleeve notes email", copyText = "Everything you need to know from the Guardian's music site, squeezed into one handy email.",link = "Sign up for the Sleeve notes email")),
    ("speakers-corner", MailingListDetails(id = 2313, label = "Speakers' Corner", title = "Get the Speakers' Corner email", copyText = "The most shared comment, analysis and editorial articles delivered every weekday lunchtime.",link = "Sign up for the Speakers' Corner email")),
    ("the-breakdown", MailingListDetails(id = 219, label = "The Breakdown", title = "Sign up for The Breakdown email", copyText = "Every Thursday Paul Rees gives his thoughts on the big stories and reviews the latest action.",link = "Sign up for The Breakdown email")),
    ("the-fiver", MailingListDetails(id = 218, label = "The Fiver", title = "Sign up for The Fiver email", copyText = "The Guardian's free football email, delivered every weekday at around 5pm — hence the name.",link = "Sign up for The Fiver email")),
    ("the-flyer", MailingListDetails(id = 2211, label = "The Flyer", title = "Sign up for The Flyer email", copyText = "All the latest travel stories, UK hotel and restaurant reviews, insider tips and inspiring top 10s.",link = "Sign up for The Flyer email")),
    ("the-spin", MailingListDetails(id = 220, label = "The Spin", title = "Sign up for The Spin email", copyText = "All the latest comment and news, rumour and humour from the world of cricket every Tuesday.",link = "Sign up for The Spin email")),
    ("zip-file", MailingListDetails(id = 1902, label = "Zip file", title = "Get the Guardian's Zip file email", copyText = "For all you need to know about technology in the world this week, news, analysis and comment.",link = "Sign up for the Zip file email"))
  )


	val FormIdFromSection: Map[String, String] = Map(
		("artanddesign", "art-weekly"),
		("books", "book-club"),
		("film", "film-today"),
		("music", "sleeve-notes"),
		("environment", "green-light"),
		("crosswords", "crossword-update"),
		("fashion", "fashion-statement"),
		("money", "money-talks"),
		("global-development", "poverty-matters"),
		("media", "media-briefing"),
		("society", "society-briefing"),
		("technology", "zip-file"),
		("uk-news", "daily-email"),
		("world", "daily-email"),
		("football", "the-fiver"),
		("travel", "the-flyer"),
		("commentisfree", "speakers-corner")
	)

	val FormIdFromTag: Map[String, String] = Map(
        "australian-politics" -> "australian-politics",
        "cricket" -> "the-spin",
        "food & drink" -> "observer-monthly",
        "Rugby union" -> "the-breakdown"
  )

  def mailingListDetailsFor(content: Content, edition: Edition): Option[MailingListDetails] = {
    val formId: Option[String] = {
      val matchingFormIdsFromTags = content.tags.flatMap(tag => FormIdFromTag.get(tag.id))

      val formIdFromSection: Option[String] = FormIdFromSection.get(content.section.toLowerCase()).map {
        rawFormId =>
        val editionExtension = if (rawFormId == "daily-email" && edition.id.toLowerCase() != "uk") s"-$edition" else ""
        rawFormId + editionExtension
      }

      matchingFormIdsFromTags.headOption.orElse(formIdFromSection)
    }

    formId.flatMap(MailingLists.get(_))
  }

}