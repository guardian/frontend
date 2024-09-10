package cricket.feed

import cricketModel.Player
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class PlayerNamesTest extends AnyFlatSpec with Matchers {

  "uniqueNames" should "be determined by lastName if players have different last names" in {
    val player1 = Player(id = "ae5e0dbf-d6af-70ec-76ef-1f8e83230405", name = "Asitha Fernando", firstName = "Asitha", lastName = "Fernando", initials = "A M")
    val player2 = Player(id = "c32cd9c7-d38a-93e7-e874-f5f4a5197812", name = "Dimuth Karunaratne", firstName= "Frank", lastName = "Karunaratne", initials = "F D M")
    val player3 = Player(id = "b96e5130-0348-9659-e3c6-ba887f306eeb", name = "Kusal Mendis", firstName = "Balapuwaduge", lastName = "Mendis", initials = "B K G")

    PlayerNames.uniqueNames(List(player1, player2, player3)).values.toList should contain ("Fernando")
    PlayerNames.uniqueNames(List(player1, player2, player3)).values.toList should contain ("Mendis")
    PlayerNames.uniqueNames(List(player1, player2, player3)).values.toList should contain ("Karunaratne")
  }

  "uniqueNames" should "be determined by full name and lastName if players have the same last name" in {
    val player1 = Player(id = "ae5e0dbf-d6af-70ec-76ef-1f8e83230405", name = "Asitha Fernando", firstName = "Asitha", lastName = "Fernando", initials = "A M")
    val player2 = Player(id = "c32cd9c7-d38a-93e7-e874-f5f4a5197812", name = "Dimuth Karunaratne", firstName= "Frank", lastName = "Karunaratne", initials = "F D M")
    val player3 = Player(id = "d29c8d1c-29b4-517e-5b62-1277065801b2", name = "Nishan Madushka", firstName = "Kottasinghakkarage", lastName = "Fernando", initials = "K N M")

    PlayerNames.uniqueNames(List(player1, player2, player3)).values.toList should contain("Asitha Fernando")
    PlayerNames.uniqueNames(List(player1, player2, player3)).values.toList should contain("Karunaratne")
    PlayerNames.uniqueNames(List(player1, player2, player3)).values.toList should contain("Kottasinghakkarage Fernando")
  }
}

