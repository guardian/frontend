package services

import org.scalatest._
import test.ConfiguredTestSuite

@DoNotDiscover class NewspapeQueryTest extends FreeSpec with ShouldMatchers with ConfiguredTestSuite {

  "NewspapeQueryTest" - {
    "lowercase display name except UK news and US news" in {
      NewspaperQuery.lowercaseDisplayName("International") should be("international")
      NewspaperQuery.lowercaseDisplayName("UK news") should be("UK news")
      NewspaperQuery.lowercaseDisplayName("US news") should be("US news")
    }

  }
}
