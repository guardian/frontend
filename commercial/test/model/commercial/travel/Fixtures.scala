package model.commercial.travel

import org.joda.time.DateTime

object Fixtures {

  val untaggedOffers = List(
    TravelOffer(5098,
      "Country houses of Northamptonshire and Lincolnshire",
      "http://www.guardianholidayoffers.co.uk/holiday/5098/country-houses-of-northamptonshire-and-lincolnshire",
      "http://www.guardianholidayoffers.co.uk/Image.aspx?id=37200&type=NoResize",
      "645",
      new DateTime(2014, 6, 8, 0, 0),
      Nil,
      List("United Kingdom"),
      "Tours",
      List("Special interest holidays"),
      "4",
      1),
    TravelOffer(3421,
      "Italian Riviera by rail",
      "http://www.guardianholidayoffers.co.uk/holiday/3421/italian-riviera",
      "http://www.guardianholidayoffers.co.uk/Image.aspx?id=27156&type=NoResize",
      "999",
      new DateTime(2014, 5, 2, 0, 0),
      Nil,
      List("Italy"),
      "Tours",
      List("Rail holidays", "Tours"),
      "7",
      2),
    TravelOffer(3381,
      "Lake Annecy by rail",
      "http://www.guardianholidayoffers.co.uk/holiday/3381/lake-annecy-les-grillons-hotel-half-board-",
      "http://www.guardianholidayoffers.co.uk/Image.aspx?id=27167&type=NoResize",
      "699",
      new DateTime(2014, 10, 8, 0, 0),
      Nil,
      List("France"),
      "Tours",
      List("Tours", "Rail holidays"),
      "5",
      3)
  )
}
