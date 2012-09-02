package test

import org.scalatest.matchers.ShouldMatchers
import org.scalatest.{ Informer, GivenWhenThen, FeatureSpec }
import collection.JavaConversions._
import collection.JavaConverters._
import org.fluentlenium.core.domain.{ FluentWebElement, FluentList }
import conf.Configuration

class AnalyticsFeatureTest extends FeatureSpec with GivenWhenThen with ShouldMatchers {

  implicit val config = Configuration

  feature("Analytics") {

    // Feature 

    info("In order understand how people are using the website and provide data for auditing")
    info("As a product manager")
    info("I want record usage metrics")

    // Scenarios

    scenario("Omniture tracks user actions") {

      given("I am on an article entitled 'Liu Xiang pulls up in opening race at second consecutive Olympics'")
      HtmlUnit("/sport/2012/aug/07/liu-xiang-injured-olympics") { browser =>
        import browser._

        then("the Omniture web bug should record my visit")
        val webbug = findFirst("#omnitureNoScript img")
        
        webbug.getAttribute("src") should startWith("http://hits.guardian.co.uk/b/ss/guardiangu-mobiledev/1/H.24.1.1/") 

      }
    }
    
    scenario("Ophan tracks user actions") (pending)

  }
}
