package cricket.feed

import conf.cricketPa.Parser.descriptionWithUniqueNames
import cricketModel.{Player, Team}
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class CricketPaDeserialisationTest extends AnyFlatSpec with Matchers {

  val teamWithPlayersWithUniqueSurnames = Team(
    name = "Sri Lanka",
    id = "0cbc23be-e7cc-9574-611a-06561460eb8b",
    home = false,
    lineup = List("Asitha Fernando", "Dimuth Karunaratne", "Kusal Mendis"),
    players = List(
      Player(
        id = "ae5e0dbf-d6af-70ec-76ef-1f8e83230405",
        name = "Asitha Fernando",
        firstName = "Asitha",
        lastName = "Fernando",
        initials = "A M",
      ),
      Player(
        id = "c32cd9c7-d38a-93e7-e874-f5f4a5197812",
        name = "Dimuth Karunaratne",
        firstName = "Frank",
        lastName = "Karunaratne",
        initials = "F D M",
      ),
      Player(
        id = "b96e5130-0348-9659-e3c6-ba887f306eeb",
        name = "Kusal Mendis",
        firstName = "Balapuwaduge",
        lastName = "Mendis",
        initials = "B K G",
      ),
      Player(
        id = "46a55cb7-49f5-e9f7-7560-c7110b0f68ec",
        name = "Dinesh Chandimal",
        firstName = "Lokuge",
        lastName = "Chandimal",
        initials = "L D",
      ),
    ),
  )

  val teamWithPlayersWithTheSameSurname = Team(
    name = "Sri Lanka",
    id = "0cbc23be-e7cc-9574-611a-06561460eb8b",
    home = false,
    lineup = List("Asitha Fernando", "Dimuth Karunaratne", "Nishan Madushka"),
    players = List(
      Player(
        id = "ae5e0dbf-d6af-70ec-76ef-1f8e83230405",
        name = "Asitha Fernando",
        firstName = "Asitha",
        lastName = "Fernando",
        initials = "A M",
      ),
      Player(
        id = "c32cd9c7-d38a-93e7-e874-f5f4a5197812",
        name = "Dimuth Karunaratne",
        firstName = "Frank",
        lastName = "Karunaratne",
        initials = "F D M",
      ),
      Player(
        id = "d29c8d1c-29b4-517e-5b62-1277065801b2",
        name = "Nishan Madushka",
        firstName = "Kottasinghakkarage",
        lastName = "Fernando",
        initials = "K N M",
      ),
      Player(
        id = "46a55cb7-49f5-e9f7-7560-c7110b0f68ec",
        name = "Dinesh Chandimal",
        firstName = "Lokuge",
        lastName = "Chandimal",
        initials = "L D",
      ),
    ),
  )

  "descriptionWithUniqueNames" should "include catcher's and bowler's surname if this is enough to determine their unique name when dismissal type is caught" in {

    descriptionWithUniqueNames(
      bowlingTeam = Some(teamWithPlayersWithUniqueSurnames),
      catcherId = "46a55cb7-49f5-e9f7-7560-c7110b0f68ec",
      bowlerId = "ae5e0dbf-d6af-70ec-76ef-1f8e83230405",
      description = "c Chandimal b Fernando",
    ) shouldEqual "c Chandimal b Fernando"

  }

  it should "include catcher's first name and surname if other player with the same surname exists in the same team when dismissal type is caught" in {
    descriptionWithUniqueNames(
      bowlingTeam = Some(teamWithPlayersWithTheSameSurname),
      catcherId = "ae5e0dbf-d6af-70ec-76ef-1f8e83230405",
      bowlerId = "46a55cb7-49f5-e9f7-7560-c7110b0f68ec",
      description = "c Chandimal b Fernando",
    ) shouldEqual "c Asitha Fernando b Chandimal"
  }

  it should "include bowler's first name and surname if other player with the same surname exists in the same team when dismissal type is caught" in {
    descriptionWithUniqueNames(
      bowlingTeam = Some(teamWithPlayersWithTheSameSurname),
      catcherId = "46a55cb7-49f5-e9f7-7560-c7110b0f68ec",
      bowlerId = "ae5e0dbf-d6af-70ec-76ef-1f8e83230405",
      description = "c Chandimal b Fernando",
    ) shouldEqual "c Chandimal b Asitha Fernando"
  }

  it should "include bowler's surname if this is enough to determine their unique name when dismissal type is bowled" in {
    descriptionWithUniqueNames(
      bowlingTeam = Some(teamWithPlayersWithUniqueSurnames),
      catcherId = "",
      bowlerId = "ae5e0dbf-d6af-70ec-76ef-1f8e83230405",
      description = "b Fernando",
    ) shouldEqual "b Fernando"
  }

  it should "include bowler's first name and surname if other player with the same surname exists in the same team when dismissal type is bowled" in {
    descriptionWithUniqueNames(
      bowlingTeam = Some(teamWithPlayersWithTheSameSurname),
      catcherId = "",
      bowlerId = "ae5e0dbf-d6af-70ec-76ef-1f8e83230405",
      description = "b Fernando",
    ) shouldEqual "b Asitha Fernando"
  }

  it should "include catcher's surname if this is enough to determine their unique name when dismissal type is stumped" in {
    descriptionWithUniqueNames(
      bowlingTeam = Some(teamWithPlayersWithUniqueSurnames),
      catcherId = "46a55cb7-49f5-e9f7-7560-c7110b0f68ec",
      bowlerId = "ae5e0dbf-d6af-70ec-76ef-1f8e83230405",
      description = "st Chandimal b Fernando",
    ) shouldEqual "st Chandimal b Fernando"
  }

  it should "include catcher's first name and surname if other player with the same surname exists in the same team when dismissal type is stumped" in {
    descriptionWithUniqueNames(
      bowlingTeam = Some(teamWithPlayersWithTheSameSurname),
      catcherId = "46a55cb7-49f5-e9f7-7560-c7110b0f68ec",
      bowlerId = "ae5e0dbf-d6af-70ec-76ef-1f8e83230405",
      description = "st Chandimal b Fernando",
    ) shouldEqual "st Chandimal b Asitha Fernando"
  }

  it should "include bowler's surname if this is enough to determine their unique name when dismissal type is lbw" in {
    descriptionWithUniqueNames(
      bowlingTeam = Some(teamWithPlayersWithUniqueSurnames),
      catcherId = "",
      bowlerId = "ae5e0dbf-d6af-70ec-76ef-1f8e83230405",
      description = "lbw b Fernando",
    ) shouldEqual "lbw b Fernando"
  }

  it should "include bowler's first name and surname if other player with the same surname exists in the same team when dismissal type is lbw" in {
    descriptionWithUniqueNames(
      bowlingTeam = Some(teamWithPlayersWithTheSameSurname),
      catcherId = "",
      bowlerId = "ae5e0dbf-d6af-70ec-76ef-1f8e83230405",
      description = "lbw b Fernando",
    ) shouldEqual "lbw b Asitha Fernando"
  }

  it should "be the same as initial description when dismissal type is not-out" in {
    descriptionWithUniqueNames(
      bowlingTeam = Some(teamWithPlayersWithTheSameSurname),
      catcherId = "",
      bowlerId = "",
      description = "Not Out",
    ) shouldEqual "Not Out"
  }

  it should "be the same as initial description when dismissal type is yet-to-bat" in {
    descriptionWithUniqueNames(
      bowlingTeam = Some(teamWithPlayersWithTheSameSurname),
      catcherId = "",
      bowlerId = "",
      description = "Yet to Bat",
    ) shouldEqual "Yet to Bat"
  }
}
