package layout

import layout.ContentWidths._
import org.scalatest._
import org.scalatest.concurrent.Eventually
import test.SingleServerSuite

class WidthsByBreakpointTest extends FreeSpec with ShouldMatchers with Eventually with SingleServerSuite {
  "ContentWidths" - {
    "getWidthsFromContentElement" - {
      "inline" - {
        "return correct widths for main media" in {
          ContentWidths.getWidthsFromContentElement(Inline, MainMedia) shouldEqual MainMedia.Inline
        }

        "return correct widths for body media" in {
          ContentWidths.getWidthsFromContentElement(Inline, BodyMedia) shouldEqual BodyMedia.Inline
        }
      }

      "supporting" - {
        "return correct widths for main media" in {
          ContentWidths.getWidthsFromContentElement(Supporting, MainMedia) shouldEqual unused
        }

        "return correct widths for body media" in {
          ContentWidths.getWidthsFromContentElement(Supporting, BodyMedia) shouldEqual BodyMedia.Supporting
        }
      }

      "showcase" - {
        "return correct widths for main media" in {
          ContentWidths.getWidthsFromContentElement(Showcase, MainMedia) shouldEqual MainMedia.Showcase
        }

        "return correct widths for body media" in {
          ContentWidths.getWidthsFromContentElement(Showcase, BodyMedia) shouldEqual BodyMedia.Showcase
        }
      }

      "thumbnail" - {
        "return unused for main media" in {
          ContentWidths.getWidthsFromContentElement(Thumbnail, MainMedia) shouldEqual unused
        }

        "return correct widths for body media" in {
          ContentWidths.getWidthsFromContentElement(Thumbnail, BodyMedia) shouldEqual BodyMedia.Thumbnail
        }
      }
    }
  }
}
