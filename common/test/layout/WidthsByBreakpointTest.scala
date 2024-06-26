package layout

import layout.ContentWidths._
import org.scalatest.freespec.AnyFreeSpec
import org.scalatest.matchers.should.Matchers

class WidthsByBreakpointTest extends AnyFreeSpec with Matchers {
  "ContentWidths" - {
    "getWidthsFromContentElement" - {
      "inline" - {
        "return correct widths for main media" in {
          ContentWidths.getWidthsFromContentElement(Inline, MainMedia) shouldEqual MainMedia.inline
        }

        "return correct widths for body media" in {
          ContentWidths.getWidthsFromContentElement(Inline, BodyMedia) shouldEqual BodyMedia.inline
        }
      }

      "supporting" - {
        "return correct widths for main media" in {
          ContentWidths.getWidthsFromContentElement(Supporting, MainMedia) shouldEqual unused
        }

        "return correct widths for body media" in {
          ContentWidths.getWidthsFromContentElement(Supporting, BodyMedia) shouldEqual BodyMedia.supporting
        }
      }

      "showcase" - {
        "return correct widths for main media" in {
          ContentWidths.getWidthsFromContentElement(Showcase, MainMedia) shouldEqual MainMedia.showcase
        }

        "return correct widths for body media" in {
          ContentWidths.getWidthsFromContentElement(Showcase, BodyMedia) shouldEqual BodyMedia.showcase
        }
      }

      "thumbnail" - {
        "return unused for main media" in {
          ContentWidths.getWidthsFromContentElement(Thumbnail, MainMedia) shouldEqual unused
        }

        "return correct widths for body media" in {
          ContentWidths.getWidthsFromContentElement(Thumbnail, BodyMedia) shouldEqual BodyMedia.thumbnail
        }
      }
    }
  }
}
