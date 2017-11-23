package test


import org.fluentlenium.core.domain.FluentWebElement
import org.scalatest.Suites

object `package` {

  implicit class WebElement2rich(element: FluentWebElement) {
    lazy val href = element.attribute("href")

    def hasAttribute(name: String): Boolean = element.attribute(name) != null
  }

}

class FaciaTestSuite extends Suites (
  new model.FaciaPageTest,
  new controllers.front.FaciaDefaultsTest,
  new layout.slices.DynamicFastTest,
  new layout.slices.DynamicSlowTest,
  new layout.slices.StoryTest,
  new views.fragments.nav.NavigationTest,
  new FaciaControllerTest,
  new metadata.FaciaMetaDataTest
) with SingleServerSuite {
  override lazy val port: Int = 19009
}
