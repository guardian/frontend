package test

import org.scalatest.DoNotDiscover
import org.scalatest.matchers.should.Matchers
import play.api.libs.json.Json
import discussion.model.Profile
import org.scalatest.flatspec.AnyFlatSpec

@DoNotDiscover class ProfileTest extends AnyFlatSpec with Matchers with ConfiguredTestSuite {

  "Profile" should "parse JSON Profile with no optional fields" in {
    val jsonStr = """{"userProfile": {
      |  "userId": "Bob1",
      |  "secureAvatarUrl": "http://foo.com/pic",
      |  "avatar": "http://foo.com/pic",
      |  "displayName": "Bob"
      |}}""".stripMargin
    val json = Json.parse(jsonStr)
    val profile = Profile(json)
    profile.userId should be("Bob1")
    profile.avatar should be("http://foo.com/pic")
    profile.displayName should be("Bob")
    profile.isStaff should be(false)
    profile.isContributor should be(false)
    profile.privateFields should be(None)
  }

  it should "parse JSON Profile with optional fields" in {
    val jsonStr = """{"userProfile": {
                    |  "userId": "Bob1",
                    |  "avatar": "http://foo.com/pic",
                    |  "secureAvatarUrl": "http://foo.com/pic",
                    |  "displayName": "Bob",
                    |  "badge": [{"name": "Staff"}],
                    |  "privateFields":
                    |  {
                    |    "canPostComment": true,
                    |    "isPremoderated": false
                    |  }
                    |}}""".stripMargin
    val json = Json.parse(jsonStr)
    val profile = Profile(json)
    profile.avatar should be("http://foo.com/pic")
    profile.displayName should be("Bob")
    profile.isStaff should be(true)
    profile.isContributor should be(false)
    val privateFields = profile.privateFields
    privateFields.isDefined should be(true)
    val fields = privateFields.get
    fields.canPostComment should be(true)
    fields.isPremoderated should be(false)
  }

}
