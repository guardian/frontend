package discussion.model

import org.scalatest.FreeSpec

class DiscussionKeyTest extends FreeSpec {

  "DiscussionKey" - {

    "should not be an empty string" in {
      intercept[IllegalArgumentException] {
        DiscussionKey("")
      }
    }
    "should not be null" in {
      intercept[IllegalArgumentException] {
        DiscussionKey(null)
      }
    }
    "should not be valid for /boo" in {
      intercept[IllegalArgumentException] {
        DiscussionKey("/boo")
      }
    }
    "should be valid for /p/12de3" in {
      assert("/p/12de3" === DiscussionKey("/p/12de3").toString)
    }

    "should be valid for p/9993s" in {
      assert("p/9993s" === DiscussionKey("p/9993s").toString)
    }
  }

}
