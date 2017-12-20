import org.scalatest.Suites
import test.SingleServerSuite
import controllers._
import integrations._
import services.{TagPageGroupingTest, TagPageTest}

class TagPageTestSuite extends Suites (
  new AllTagControllerTest,
  new AllTagTemplateTest,
  new CombinerControllerTest,
  new CombinerFeatureTest,
  new TagControllerTest,
  new TagMetaDataTest,
  new LatestTagControllerTest,
  new TagPageTest,
  new TagPageGroupingTest,
  new TagFeatureTest,
  new TagTemplateTest,
  new SectionTemplateTest
) with SingleServerSuite {
  override lazy val port: Int = 19003
}

