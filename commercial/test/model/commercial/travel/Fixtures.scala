package model.commercial.travel

import org.joda.time.DateTime

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
      "4",
      1),
    Offer(1,
      "Italian Riviera by rail",
      "http://www.guardianholidayoffers.co.uk/holiday/3421/italian-riviera",
      "http://www.guardianholidayoffers.co.uk/Image.aspx?id=27156&type=NoResize",
      "999",
      new DateTime(2014, 5, 2, 0, 0),
      Nil,
      List("Italy"),
      "7",
      2),
    Offer(2,
      "Lake Annecy by rail",
      "http://www.guardianholidayoffers.co.uk/holiday/3381/lake-annecy-les-grillons-hotel-half-board-",
      "http://www.guardianholidayoffers.co.uk/Image.aspx?id=27167&type=NoResize",
      "699",
      new DateTime(2014, 10, 8, 0, 0),
      Nil,
      List("France"),
      "5",
      3)
  )
}
