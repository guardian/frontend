package football

import driver.Driver
import org.scalatest.concurrent.Eventually
import org.scalatest.{FreeSpec, Matchers}


class FootballAllComponentsTest extends FreeSpec with Matchers with Driver with Eventually {

  "Football all" - {

    go to theguardian("/football/all")

    "should show the 'all index' component" in {
      $("[data-component='all index']").length shouldBe > (0)
    }
  }
}
