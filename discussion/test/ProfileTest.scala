package test

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import play.api.libs.json.Json
import discussion.model.Profile

class ProfileTest extends FlatSpec with ShouldMatchers{

  "Profile" should "parse JSON Profile with no optional fields" in{
    val jsonStr = """{"userProfile": {
      |  "userId": "Bob1",
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

  it should "parse JSON Profile with optional fields" in{
    val jsonStr = """{"userProfile": {
                    |  "userId": "Bob1",
                    |  "avatar": "http://foo.com/pic",
                    |  "displayName": "Bob",
                    |  "badge": [{"name": "Staff"}],
                    |  "privateFields":
                    |  {
                    |    "canPostComment": true,
                    |    "isPremoderated": false,
                    |    "isSocial": true
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
    fields.isSocial should be(true)
  }

}
