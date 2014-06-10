package dfp

import model.Config
import org.scalatest.Inspectors._
import org.scalatest.{FlatSpec, Matchers}
import play.api.test.FakeApplication
import play.api.test.Helpers._

class DfpAgentTest extends FlatSpec with Matchers {

  def apiQuery(apiQuery: String) = {
    Config("id", Some(apiQuery), None, None)
  }

  "isSponsored" should "be true for a sponsored container" in running(FakeApplication()) {

    val apiQueries = Seq(
      "search?tag=books%2Fmedia&section=money",
      "search?tag=environment%2Fblog%7Cmedia%2Fmedia%2Fguardian-environment-blogs%7Cenvironment" +
      "%2Fgeorgemonbiot%7Cenvironment%2Fdamian-carrington-blog%7books%2Fmedia",
      "search?tag=media%2Fmedia&section=sport&page-size=50",
      "search?tag=books%2Fmedia&section=culture%7Cmusic%7Cmedia%7Cbooks%7Cartanddesign%7Cstage%7Ctv-and-radio",
      "search?tag=(tone%2Fanalysis%2C(world%2Fusa%7Cmedia%2Fmedia))%7C(tone%2Fcomment%2C" +
      "(world%2Fusa%7Cbusiness%2Fus-personal-finance))&section=business",
      "search?tag=business/financial-sector|business/manufacturing-sector|business/luxury-goods-sector|business" +
      "/fooddrinks|business/theairlineindustry|business/automotive-industry|business/banking|business/construction" +
      "|mediao/media|business/healthcare|business/insurance|business/mining|business/musicindustry|business" +
      "/pharmaceuticals-industry|business/realestate|business/retail|business/technology|media/media|business" +
      "/tobacco-industry|business/travelleisure|business/utilities|business/services-sector",
      "media?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "search?tag=world/mongolia|world/afghanistan|books/media|world/bangladesh|world/bhutan|world/burma|world" +
      "/kazakhstan|world/kyrgyzstan|world/india|world/maldives|world/nepal|world/pakistan|world/srilanka|world" +
      "/tajikistan|world/turkmenistan|world/uzbekistan|world/brunei|world/cambodia|world/china|world/indonesia|world" +
      "/japan|world/laos|world/mongolia|world/malaysia|world/north-korea|world/philippines|world/singapore|world" +
      "/south-korea|world/taiwan|world/thailand|world/vietnam|world/timor-leste|world/tibet",
      "books/media",
      "books/media?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "media?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "books/media?edition=au",
      "media"
    )

    forEvery(apiQueries) { q =>
      DfpAgent.isSponsored(apiQuery(q)) should be(true)
    }
  }

  "isSponsored" should "be false for a non sponsored container" in running(FakeApplication()) {

    val apiQueries = Seq(
      "search?tag=type%2Fvideo&section=money",
      "search?tag=environment%2Fblog%7Cenvironment%2Fseries%2Fguardian-environment-blogs%7Cenvironment" +
      "%2Fgeorgemonbiot%7Cenvironment%2Fdamian-carrington-blog%7Cenvironment%2Fbike-blog",
      "search?tag=type%2Fgallery&section=sport&page-size=50",
      "search?tag=tone%2Freviews&section=culture%7Cmusic%7Cculture%7Cbooks%7Cartanddesign%7Cstage%7Ctv-and-radio",
      "search?tag=(tone%2Fanalysis%2C(world%2Fusa%7Cbusiness%2Fus-personal-finance))%7C(tone%2Fcomment%2C" +
      "(world%2Fusa%7Cbusiness%2Fus-personal-finance))&section=business",
      "search?tag=business/financial-sector|business/manufacturing-sector|business/luxury-goods-sector|business" +
      "/fooddrinks|business/theairlineindustry|business/automotive-industry|business/banking|business/construction" +
      "|film/film-industry|business/healthcare|business/insurance|business/mining|business/musicindustry|business" +
      "/pharmaceuticals-industry|business/realestate|business/retail|business/technology|business/telecoms|business" +
      "/tobacco-industry|business/travelleisure|business/utilities|business/services-sector",
      "technology?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "search?tag=world/mongolia|world/afghanistan|world/azerbaijan|world/bangladesh|world/bhutan|world/burma|world" +
      "/kazakhstan|world/kyrgyzstan|world/india|world/maldives|world/nepal|world/pakistan|world/srilanka|world" +
      "/tajikistan|world/turkmenistan|world/uzbekistan|world/brunei|world/cambodia|world/china|world/indonesia|world" +
      "/japan|world/laos|world/mongolia|world/malaysia|world/north-korea|world/philippines|world/singapore|world" +
      "/south-korea|world/taiwan|world/thailand|world/vietnam|world/timor-leste|world/tibet",
      "news/special",
      "uk/money?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "au?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "sport/motorsports?edition=au",
      "environment"
    )

    forEvery(apiQueries) { q =>
      DfpAgent.isSponsored(apiQuery(q)) should be(false)
    }
  }

  "isAdvertisementFeature" should "be true for an advertisement feature container" in running(FakeApplication()) {

    val apiQueries = Seq(
      "search?tag=books%2Ffilm&section=money",
      "search?tag=environment%2Fblog%7Cfilm%2Ffilm%2Fguardian-environment-blogs%7Cenvironment" +
      "%2Fgeorgemonbiot%7Cenvironment%2Fdamian-carrington-blog%7books%2Ffilm",
      "search?tag=film%2Ffilm&section=sport&page-size=50",
      "search?tag=books%2Ffilm&section=culture%7Cmusic%7Cfilm%7Cbooks%7Cartanddesign%7Cstage%7Ctv-and-radio",
      "search?tag=(tone%2Fanalysis%2C(world%2Fusa%7Cfilm%2Ffilm))%7C(tone%2Fcomment%2C" +
      "(world%2Fusa%7Cbusiness%2Fus-personal-finance))&section=business",
      "search?tag=business/financial-sector|business/manufacturing-sector|business/luxury-goods-sector|business" +
      "/fooddrinks|business/theairlineindustry|business/automotive-industry|business/banking|business/construction" +
      "|filmo/film|business/healthcare|business/insurance|business/mining|business/musicindustry|business" +
      "/pharmaceuticals-industry|business/realestate|business/retail|business/technology|film/film|business" +
      "/tobacco-industry|business/travelleisure|business/utilities|business/services-sector",
      "film?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "search?tag=world/mongolia|world/afghanistan|books/film|world/bangladesh|world/bhutan|world/burma|world" +
      "/kazakhstan|world/kyrgyzstan|world/india|world/maldives|world/nepal|world/pakistan|world/srilanka|world" +
      "/tajikistan|world/turkmenistan|world/uzbekistan|world/brunei|world/cambodia|world/china|world/indonesia|world" +
      "/japan|world/laos|world/mongolia|world/malaysia|world/north-korea|world/philippines|world/singapore|world" +
      "/south-korea|world/taiwan|world/thailand|world/vietnam|world/timor-leste|world/tibet",
      "books/film",
      "books/film?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "film?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "books/film?edition=au",
      "film"
    )

    forEvery(apiQueries) { q =>
      DfpAgent.isAdvertisementFeature(apiQuery(q)) should be(true)
    }
  }

  "isAdvertisementFeature" should "be false for a non advertisement feature container" in running(FakeApplication()) {

    val apiQueries = Seq(
      "search?tag=type%2Fvideo&section=money",
      "search?tag=environment%2Fblog%7Cenvironment%2Fseries%2Fguardian-environment-blogs%7Cenvironment" +
      "%2Fgeorgemonbiot%7Cenvironment%2Fdamian-carrington-blog%7Cenvironment%2Fbike-blog",
      "search?tag=type%2Fgallery&section=sport&page-size=50",
      "search?tag=tone%2Freviews&section=culture%7Cmusic%7Cculture%7Cbooks%7Cartanddesign%7Cstage%7Ctv-and-radio",
      "search?tag=(tone%2Fanalysis%2C(world%2Fusa%7Cbusiness%2Fus-personal-finance))%7C(tone%2Fcomment%2C" +
      "(world%2Fusa%7Cbusiness%2Fus-personal-finance))&section=business",
      "search?tag=business/financial-sector|business/manufacturing-sector|business/luxury-goods-sector|business" +
      "/fooddrinks|business/theairlineindustry|business/automotive-industry|business/banking|business/construction" +
      "|film/film-industry|business/healthcare|business/insurance|business/mining|business/musicindustry|business" +
      "/pharmaceuticals-industry|business/realestate|business/retail|business/technology|business/telecoms|business" +
      "/tobacco-industry|business/travelleisure|business/utilities|business/services-sector",
      "technology?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "search?tag=world/mongolia|world/afghanistan|world/azerbaijan|world/bangladesh|world/bhutan|world/burma|world" +
      "/kazakhstan|world/kyrgyzstan|world/india|world/maldives|world/nepal|world/pakistan|world/srilanka|world" +
      "/tajikistan|world/turkmenistan|world/uzbekistan|world/brunei|world/cambodia|world/china|world/indonesia|world" +
      "/japan|world/laos|world/mongolia|world/malaysia|world/north-korea|world/philippines|world/singapore|world" +
      "/south-korea|world/taiwan|world/thailand|world/vietnam|world/timor-leste|world/tibet",
      "news/special",
      "uk/money?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "au?show-most-viewed=true&show-editors-picks=false&hide-recent-content=true",
      "sport/motorsports?edition=au",
      "environment"
    )

    forEvery(apiQueries) { q =>
      DfpAgent.isAdvertisementFeature(apiQuery(q)) should be(false)
    }
  }
}
