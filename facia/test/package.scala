package test

import org.scalatest.Suites
import services.dotcomrendering.FaciaPickerTest

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
