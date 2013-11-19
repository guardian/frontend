package model.commercial.jobs

object LightFixtures {

  val xml =
    """
      |<Jobs>
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
      |  </Job>
      |  <Job>
      |    <JobID>4302057</JobID>
      |    <JobTitle>Listen Laugh and Learn in Worcestershire</JobTitle>
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
      |    <RecruiterLogoURL>http://jobs.theguardian.com/getasset/?uiAssetID=70666A14-BD49-4BB8-AC6A-FCF8B716E131</RecruiterLogoURL>
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
      |  </Job>
      |  <Job>
      |    <JobID>4411510</JobID>
      |    <JobTitle>Air Traffic Controller</JobTitle>
      |    <RecruiterName>RAF CAREERS</RecruiterName>
      |    <ShortJobDescription>Control some of the world’s most modern aircraft using radar and communications equipment</ShortJobDescription>
      |    <Sectors>
      |      <Sector>166</Sector>
      |      <Sector>308</Sector>
      |    </Sectors>
      |    <RecruiterLogoURL>http://jobs.theguardian.com/getasset/?uiAssetID=14357B35-BBA3-4F96-ADF3-F9ABC82C894C</RecruiterLogoURL>
      |  </Job>
      |</Jobs>
      | """.stripMargin

  val jobs = List(

    LightJob(1058606,
      "Area Management Training Programme (Graduate Area Manager)",
      "We're only looking for outstanding individuals for the Aldi Management Programme.",
      "ALDI",
      Some("http://jobs.theguardian.com/getasset/?uiAssetID=833D7672-6B21-4D81-BCE1-9CEF11CCEA21"),
      Set(149, 158, 245)
    ),

    LightJob(4302057,
      "Listen Laugh and Learn in Worcestershire",
      "The role of Association Visitor is a highly rewarding one with many opportunities for developing your own skills and knowledge, whilst being part of a team. Professional qualifications or personal experience of MND are not necessary...",
      "MOTOR NEURONE DISEASE ASSOCIATION",
      Some("http://jobs.theguardian.com/getasset/?uiAssetID=70666A14-BD49-4BB8-AC6A-FCF8B716E131"),
      Set(111, 112, 121, 286, 600117, 600190)
    ),

    LightJob(4365671,
      "Female Youth Work Volunteer in sports",
      "The Active Women's project helps young women access sports activities in their local area in Southampton. Volunteers will support the running of these sessions, as well as supporting the young women in accessing the sessions.",
      "CATCH 22",
      Some("http://jobs.theguardian.com/getasset/?uiAssetID=1D428A1F-65B4-4ADE-8CA3-91F2AE7423E3"),
      Set(111, 112, 115, 219, 222, 600118, 600119)
    ),

    LightJob(4411510,
      "Air Traffic Controller",
      "Control some of the world’s most modern aircraft using radar and communications equipment",
      "RAF CAREERS",
      Some("http://jobs.theguardian.com/getasset/?uiAssetID=14357B35-BBA3-4F96-ADF3-F9ABC82C894C"),
      Set(166, 308)
    )

  )

}
