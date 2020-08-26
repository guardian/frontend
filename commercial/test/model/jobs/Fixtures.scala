package commercial.model.merchandise.jobs

import commercial.model.merchandise.Job

object Fixtures {

  val xml =
    """
      |<rootnode><Jobs>
      |  <Job>
      |    <JobID>1058606</JobID>
      |    <JobTitle>Area Management Training Programme (Graduate Area Manager)</JobTitle>
      |    <RecruiterName>ALDI</RecruiterName>
      |    <ShortJobDescription>We're only looking for outstanding individuals for the Aldi Management Programme.</ShortJobDescription>
      |    <Sectors>
      |      <Sector>149</Sector>
      |      <Sector>158</Sector>
      |      <Sector>245</Sector>
      |    </Sectors>
      |    <RecruiterLogoURL>http://jobs.theguardian.com/getasset/?uiAssetID=833D7672-6B21-4D81-BCE1-9CEF11CCEA21</RecruiterLogoURL>
      |    <SalaryDescription>Unpaid Voluntary Work</SalaryDescription>
      |    <LocationDescription>Rotherham/Sheffield</LocationDescription>
      |    <RecruiterPageUrl>http://jobs.theguardian.com/employer/196643/</RecruiterPageUrl>
      |  </Job>
      |  <Job>
      |    <JobID>4302057</JobID>
      |    <JobTitle>Listen Laugh &amp; Learn in Worcestershire</JobTitle>
      |    <RecruiterName>MOTOR NEURONE DISEASE ASSOCIATION</RecruiterName>
      |    <ShortJobDescription>The role of Association Visitor is a highly rewarding one with many opportunities for developing your own skills and knowledge, whilst being part of a team. Professional qualifications or personal experience of MND are not necessary...</ShortJobDescription>
      |    <Sectors>
      |      <Sector>111</Sector>
      |      <Sector>112</Sector>
      |      <Sector>121</Sector>
      |      <Sector>286</Sector>
      |      <Sector>600117</Sector>
      |      <Sector>600190</Sector>
      |    </Sectors>
      |    <SalaryDescription>Unpaid Voluntary Work</SalaryDescription>
      |    <LocationDescription>Rotherham/Sheffield</LocationDescription>
      |    <RecruiterPageUrl>http://jobs.theguardian.com/employer/196644/</RecruiterPageUrl>
      |  </Job>
      |  <Job>
      |    <JobID>4365671</JobID>
      |    <JobTitle>Female Youth Work Volunteer in sports</JobTitle>
      |    <RecruiterName>CATCH 22</RecruiterName>
      |    <ShortJobDescription>The Active Women's project helps young women access sports activities in their local area in Southampton. Volunteers will support the running of these sessions, as well as supporting the young women in accessing the sessions.</ShortJobDescription>
      |    <Sectors>
      |      <Sector>111</Sector>
      |      <Sector>112</Sector>
      |      <Sector>115</Sector>
      |      <Sector>219</Sector>
      |      <Sector>222</Sector>
      |      <Sector>600118</Sector>
      |      <Sector>600119</Sector>
      |    </Sectors>
      |    <RecruiterLogoURL>http://jobs.theguardian.com/getasset/?uiAssetID=1D428A1F-65B4-4ADE-8CA3-91F2AE7423E3</RecruiterLogoURL>
      |    <SalaryDescription>Unpaid Voluntary Work</SalaryDescription>
      |    <LocationDescription>Rotherham/Sheffield</LocationDescription>
      |    <RecruiterPageUrl>http://jobs.theguardian.com/employer/196645/</RecruiterPageUrl>
      |  </Job>
      |  <Job>
      |    <JobID>4411510</JobID>
      |    <JobTitle>Air Traffic Controller</JobTitle>
      |    <RecruiterName>RAF CAREERS</RecruiterName>
      |    <ShortJobDescription>Control some of the world&amp;rsquo;s most modern aircraft using radar &amp; communications equipment</ShortJobDescription>
      |    <Sectors>
      |      <Sector>166</Sector>
      |      <Sector>308</Sector>
      |    </Sectors>
      |    <RecruiterLogoURL>http://jobs.theguardian.com/getasset/?uiAssetID=14357B35-BBA3-4F96-ADF3-F9ABC82C894C</RecruiterLogoURL>
      |    <SalaryDescription>Unpaid Voluntary Work</SalaryDescription>
      |    <LocationDescription>Rotherham/Sheffield</LocationDescription>
      |    <RecruiterPageUrl>http://jobs.theguardian.com/employer/196646/</RecruiterPageUrl>
      |  </Job>
      |  <Job>
      |    <JobID>6061077</JobID>
      |    <JobTitle>Uncovering the city: Urban writing seminar with Bradley L. Garrett</JobTitle>
      |    <RecruiterName>THE GUARDIAN MASTERCLASSES</RecruiterName>
      |    <ShortJobDescription>In this stimulating seminar you’ll learn how to delve beneath the surface of cities  to find stories that readers and editors will love.</ShortJobDescription>
      |    <Sectors>
      |      <Sector>101</Sector>
      |      <Sector>141</Sector>
      |      <Sector>147</Sector>
      |      <Sector>235</Sector>
      |      <Sector>237</Sector>
      |      <Sector>239</Sector>
      |      <Sector>240</Sector>
      |      <Sector>241</Sector>
      |      <Sector>600114</Sector>
      |    </Sectors>
      |    <RecruiterLogoURL>http://jobs.theguardian.com/getasset/?uiAssetID=59188A47-8B25-4F56-9F19-4BB278DB3269</RecruiterLogoURL>
      |    <SalaryDescription>na</SalaryDescription>
      |    <LocationDescription>Kings Cross, Central London</LocationDescription>
      |    <RecruiterPageUrl>http://jobs.theguardian.com/employer/230273/</RecruiterPageUrl>
      |  </Job>
      |</Jobs></rootnode>
      | """.stripMargin

  val jobs = List(
    Job(
      1058606,
      "Area Management Training Programme (Graduate Area Manager)",
      "We're only looking for outstanding individuals for the Aldi Management Programme.",
      Some("Rotherham/Sheffield"),
      "ALDI",
      Some("http://jobs.theguardian.com/employer/196643/"),
      "http://jobs.theguardian.com/getasset/?uiAssetID=833D7672-6B21-4D81-BCE1-9CEF11CCEA21",
      Seq(149, 158, 245),
      "Unpaid Voluntary Work",
    ),
    Job(
      4365671,
      "Female Youth Work Volunteer in sports",
      "The Active Women's project helps young women access sports activities in their local area in Southampton. Volunteers will support the running of these sessions, as well as supporting the young women in accessing the sessions.",
      Some("Rotherham/Sheffield"),
      "CATCH 22",
      Some("http://jobs.theguardian.com/employer/196645/"),
      "http://jobs.theguardian.com/getasset/?uiAssetID=1D428A1F-65B4-4ADE-8CA3-91F2AE7423E3",
      Seq(111, 112, 115, 219, 222, 600118, 600119),
      "Unpaid Voluntary Work",
    ),
    Job(
      4411510,
      "Air Traffic Controller",
      "Control some of the world’s most modern aircraft using radar & communications equipment",
      Some("Rotherham/Sheffield"),
      "RAF CAREERS",
      Some("http://jobs.theguardian.com/employer/196646/"),
      "http://jobs.theguardian.com/getasset/?uiAssetID=14357B35-BBA3-4F96-ADF3-F9ABC82C894C",
      Seq(166, 308),
      "Unpaid Voluntary Work",
    ),
  )

}
