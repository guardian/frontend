package cricketPa

import model.Content

case class CricketTeam(tagId: String, paId: String) {

  // e.g. sport/england-cricket-team will be england-cricket-team
  val wordsForUrl: String = tagId.split('/')(1)

}

object CricketTeams {

  // This is the list of cricket teams that we will show scores for on the site
  val teams: Seq[CricketTeam] = Seq(
    CricketTeam("sport/england-cricket-team", "a359844f-fc07-9cfa-d4cc-9a9ac0d5d075"),
    CricketTeam("sport/australia-cricket-team", "f7f611a1-e667-2aa2-c3e0-6dbc6981cfa4"),
    CricketTeam("sport/indiacricketteam", "f822b9f9-9fdc-399f-54f9-e621edaf0a28")
  )

  val teamTagIds: Seq[String] = teams.map(_.tagId)

  def byWordsForUrl(wordsForUrl: String): Option[CricketTeam] = teams.find(_.wordsForUrl == wordsForUrl)

  def teamFor(content: Content): Option[CricketTeam] = {
    val tagIds = content.tags.tags.map(_.id)
    teams.find(team => tagIds.contains(team.tagId))
  }
}
