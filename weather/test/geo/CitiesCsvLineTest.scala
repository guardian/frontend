package geo

import org.scalatest.{Matchers, FlatSpec}

class CitiesCsvLineTest extends FlatSpec with Matchers {
  "unapply" should "read a csv line" in {
    CitiesCsvLine.unapply("""19884,"DE","05","Gießen","",50.5833,8.6500,,""") shouldEqual Some(CitiesCsvLine(
      19884,
      "DE",
      "05",
      "Gießen",
      "",
      50.5833,
      8.6500,
      "",
      ""
    ))
  }
}
