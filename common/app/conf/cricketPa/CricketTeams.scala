package conf.cricketPa

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
    CricketTeam("sport/indiacricketteam", "f822b9f9-9fdc-399f-54f9-e621edaf0a28"),
    CricketTeam("sport/south-africa-cricket-team", "73f5d08d-0950-ca50-796a-a1cdbc9bd602"),
    CricketTeam("sport/west-indies-cricket-team", "cc5f2bda-bfc0-f974-09dc-e4727b3681cf"),
    CricketTeam("sport/pakistancricketteam", "d8ea81a1-538e-3cbe-f121-c65551738832"),
    CricketTeam("sport/new-zealand-cricket-team", "110c70b5-c05f-3be7-6670-baecd50a8c6b"),
    CricketTeam("sport/sri-lanka-cricket-team", "0cbc23be-e7cc-9574-611a-06561460eb8b"),
    CricketTeam("sport/afghanistan-cricket-team", "8fa4bd05-1313-eaa4-3a2d-a5ba198c17da"),
    CricketTeam("sport/bangladesh-cricket-team", "3d5e10fc-5a3f-1f06-6f1b-f86f4a7e8c10"),
  )

  val teamTagIds: Seq[String] = teams.map(_.tagId)

  def byWordsForUrl(wordsForUrl: String): Option[CricketTeam] = teams.find(_.wordsForUrl == wordsForUrl)

  def teamFor(content: Content): Option[CricketTeam] = {
    val tagIds = content.tags.tags.map(_.id)
    teams.find(team => tagIds.contains(team.tagId))
  }
}
