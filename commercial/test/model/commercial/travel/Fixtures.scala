package model.commercial.travel

import org.joda.time.DateTime
import model.commercial.Keyword

object Fixtures {

  val untaggedOffers = List(
    Offer(0,
      "Country houses of Northamptonshire and Lincolnshire",
      "http://www.guardianholidayoffers.co.uk/holiday/5098/country-houses-of-northamptonshire-and-lincolnshire",
      "http://www.guardianholidayoffers.co.uk/Image.aspx?id=37200&type=NoResize",
      "645",
      new DateTime(2014, 6, 8, 0, 0),
      Nil,
      List("United Kingdom"),
      "4"),
    Offer(1,
      "Italian Riviera by rail",
      "http://www.guardianholidayoffers.co.uk/holiday/3421/italian-riviera",
      "http://www.guardianholidayoffers.co.uk/Image.aspx?id=27156&type=NoResize",
      "999",
      new DateTime(2014, 5, 2, 0, 0),
      Nil,
      List("Italy"),
      "7"),
    Offer(2,
      "Lake Annecy by rail",
      "http://www.guardianholidayoffers.co.uk/holiday/3381/lake-annecy-les-grillons-hotel-half-board-",
      "http://www.guardianholidayoffers.co.uk/Image.aspx?id=27167&type=NoResize",
      "699",
      new DateTime(2014, 10, 8, 0, 0),
      Nil,
      List("France"),
      "5")
  )

  val offers = List(
    Offer(0,
      "Southern Tanzania",
      "http://www.guardianholidayoffers.co.uk/holiday/4980/southern-tanzania",
      "http://www.guardianholidayoffers.co.uk/Image.aspx?id=33679&type=ThreeColumn",
      "5595"
      , new DateTime(2014, 1, 12, 0, 0),
      List(Keyword("travel/tanzania", "Tanzania")),
      List("Tanzania"), "12"),
    Offer(1,
      "Lake Maggiore, Orta & the Matterhorn",
      "http://www.guardianholidayoffers.co.uk/holiday/3552/lake-maggiore-orta-and-the-matterhorn",
      "http://www.guardianholidayoffers.co.uk/Image.aspx?id=26842&type=ThreeColumn",
      "979",
      new DateTime(2014, 4, 29, 0, 0),
      List(Keyword("travel/italy", "Italy"), Keyword("travel/switzerland", "Switzerland")),
      List("Italy", "Switzerland"), "7"),
    Offer(2,
      "Horse riding holiday for intermediate and experienced riders",
      "http://www.guardianholidayoffers.co.uk/holiday/5037/horse-riding-holiday-for-intermediate-and-experienced-riders",
      "http://www.guardianholidayoffers.co.uk/Image.aspx?id=33819&type=ThreeColumn",
      "1284",
      new DateTime(2013, 11, 2, 0, 0),
      List(Keyword("travel/france", "France")),
      List("France"), "1")
  )


}
