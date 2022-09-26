package test

import org.fluentlenium.core.domain.FluentWebElement
import org.scalatest.Suites
import services.dotcomrendering.FaciaPickerTest

object `package` {

  implicit class WebElement2rich(element: FluentWebElement) {
    lazy val href = element.attribute("href")

    def hasAttribute(name: String): Boolean = element.attribute(name) != null
  }

}

class FaciaTestSuite
    extends Suites(
      new model.FaciaPageTest,
      new controllers.front.FaciaDefaultsTest,
      new layout.slices.DynamicFastTest,
      new layout.slices.DynamicSlowTest,
      new layout.slices.StoryTest,
      new FaciaControllerTest,
      new metadata.FaciaMetaDataTest,
      new FaciaPickerTest,
    )
    with SingleServerSuite {}
