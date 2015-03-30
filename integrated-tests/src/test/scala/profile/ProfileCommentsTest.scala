package integration

import Config.profileBaseUrl
import org.scalatest.tags.Retryable
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}

@DoNotDiscover @Retryable class ProfileCommentsTest extends FlatSpec with Matchers with SharedWebDriver {

  "Profile pages" should "show user comments" in {
    webDriver.get(profileTheguardian("/user/id/4383032"))
    implicitlyWait(5);

    $("[itemtype='http://schema.org/UserComments']") should not be empty
    $("[itemtype='http://schema.org/Comment']") should not be empty
  }

  they should "show replies to user comments" in {
    webDriver.get(profileTheguardian("/user/id/4383032/replies"))

    $("[itemtype='http://schema.org/UserComments']") should not be empty
    $("[itemtype='http://schema.org/Comment']") should not be empty
  }

  they should "show featured (picked) user comments" in {
    webDriver.get(profileTheguardian("/user/id/4383032/picks"))

    $("[itemtype='http://schema.org/UserComments']") should not be empty
    $("[itemtype='http://schema.org/Comment']") should not be empty
  }

  protected def profileTheguardian(path: String) = s"$profileBaseUrl$path"
}
