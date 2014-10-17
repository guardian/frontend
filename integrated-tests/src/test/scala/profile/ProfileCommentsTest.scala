package profile

import driver.Config._
import driver.Driver
import org.scalatest.tags.Retryable
import org.scalatest.{FlatSpec, Matchers}

@Retryable class ProfileCommentsTest extends FlatSpec with Matchers with Driver {

  "Profile pages" should "show user comments" in {
    go to profileTheguardian("/user/id/4383032")

    $("[itemtype='http://schema.org/UserComments']") should not be empty
    $("[itemtype='http://schema.org/Comment']") should not be empty
  }

  they should "show replies to user comments" in {
    go to profileTheguardian("/user/id/4383032/replies")

    $("[itemtype='http://schema.org/UserComments']") should not be empty
    $("[itemtype='http://schema.org/Comment']") should not be empty
  }

  they should "show featured (picked) user comments" in {
    go to profileTheguardian("/user/id/4383032/picks")

    $("[itemtype='http://schema.org/UserComments']") should not be empty
    $("[itemtype='http://schema.org/Comment']") should not be empty
  }

  protected def profileTheguardian(path: String) = s"$profileBaseUrl$path"
}
