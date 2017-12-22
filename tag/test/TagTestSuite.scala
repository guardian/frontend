package test

import org.scalatest.Suites
import controllers._
import integrations._
import services.{TagPageGroupingTest, TagPageTest}

class TagTestSuite extends Suites (
  new AllTagControllerTest,
  new AllTagTemplateTest,
  new CombinerControllerTest,
  new CombinerFeatureTest,
  new TagControllerTest,
  new TagMetaDataTest,
  new LatestTagControllerTest,
  new TagPageTest,
  new FrontPageGroupingTest,
  new TagFeatureTest,
  new TagTemplateTest,
  new SectionTemplateTest
) with SingleServerSuite {
  override lazy val port: Int = 19014
}

