package test

import java.util.{List => JList}

import org.scalatest.Suites
import services.{FacebookGraphApiTest, NewspaperControllerTest}

import collection.JavaConverters._

object `package` {

  implicit class ListString2FirstNonEmpty(list: JList[String]) {
    lazy val firstNonEmpty: Option[String] = list.asScala find { !_.isEmpty }
  }
}

class ApplicationsTestSuite extends Suites (
  new GalleryControllerTest,
  new GalleryTemplateTest,
  new ImageContentControllerTest,
  new ImageContentTemplateTest,
  new CrosswordPageMetaDataTest,
  new InteractiveControllerTest,
  new InteractiveTemplateTest,
  new MediaControllerTest,
  new MediaFeatureTest,
  new SectionTemplateTest,
  new ShareLinksTest,
  new CrosswordDataTest,
  new NewspaperControllerTest,
  new FacebookGraphApiTest
) with SingleServerSuite {
  override lazy val port: Int = 19003
}
