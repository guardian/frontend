package test

import java.util.{List => JList}
import org.scalatest.Suites
import services.{FacebookGraphApiTest, IndexPageTest, InteractivePickerTest, NewspaperControllerTest}

import collection.JavaConverters._

object `package` {

  implicit class ListString2FirstNonEmpty(list: JList[String]) {
    lazy val firstNonEmpty: Option[String] = list.asScala find { !_.isEmpty }
  }
}

class ApplicationsTestSuite
    extends Suites(
      new services.IndexPageGroupingTest,
      new common.CombinerControllerTest,
      new common.CombinerFeatureTest,
      new AllIndexControllerTest,
      new AllIndexTemplateTest,
      new AllIndexTemplateTestLite,
      new GalleryControllerTest,
      new GalleryTemplateTest,
      new ImageContentControllerTest,
      new ImageContentTemplateTest,
      new IndexControllerTest,
      new CrosswordPageMetaDataTest,
      new IndexMetaDataTest,
      new InteractiveControllerTest,
      new InteractiveTemplateTest,
      new LatestIndexControllerTest,
      new MediaControllerTest,
      new MediaFeatureTest,
      new SectionTemplateTest,
      new TagFeatureTest,
      new TagTemplateTest,
      new ShareLinksTest,
      new CrosswordDataTest,
      new NewspaperControllerTest,
      new IndexPageTest,
      new FacebookGraphApiTest,
      new InteractivePickerTest,
    )
    with SingleServerSuite {}
