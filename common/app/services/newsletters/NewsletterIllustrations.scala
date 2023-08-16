package services.newsletters

object NewsletterIllustrations {

  private val data: Map[String, String] = Map.apply(
    "morning-briefing" ->
      "https://media.guim.co.uk/77074f52e5e6f22a6636ed10d65a421426490c9e/22_0_4747_2849/500.png",
    "us-morning-newsletter" ->
      "https://media.guim.co.uk/035de4d15b7732659f574547e7cc68199c29432a/0_0_5000_3000/500.jpg",
    "morning-mail" ->
      "https://media.guim.co.uk/4cf911dd7c5cf23e4c67f0951ec39dc99f6cbc9a/0_0_1240_744/500.jpg",
    "afternoon-update" ->
      "https://media.guim.co.uk/50b02d4e4a32def95d8d26cc852549e6bd83f037/0_0_1850_1111/500.jpg",
    "green-light" ->
      "https://media.guim.co.uk/bf9a946c2bdd8011c098dfa9e8c91a94d033170f/0_0_1000_600/500.jpg",
    "tech-scape" ->
      "https://media.guim.co.uk/e4b75f936694609cff24a4a440ec07a87bc2e274/8_0_2258_1356/500.jpg",
    "the-rural-network" ->
      "https://media.guim.co.uk/23ab4cead66f6e7fcf85b2b0f97faa9fae606858/0_275_4288_2573/500.jpg",
    "today-uk" ->
      "https://media.guim.co.uk/b1e1d07a6c5645eff768afb0c2dc5eb915817cf0/1_0_5021_3014/500.png",
    "today-us" ->
      "https://media.guim.co.uk/d30b5b560d10e8bd429c848a3a6668787d88f716/2_0_5434_3262/500.png",
    "today-au" ->
      "https://media.guim.co.uk/c95f590baa23c75de13686356f12ad0b59575a72/2_0_6221_3734/500.png",
    "australian-politics" ->
      "https://media.guim.co.uk/f55f510293ee713ffcc9e48d1f420d4b2769ea49/0_0_5472_3648/500.jpg",
    "global-dispatch" ->
      "https://media.guim.co.uk/28ffd9cfbf7125265a79a664afacea6444c19cf1/0_0_2560_1536/500.jpg",
    "business-today" ->
      "https://media.guim.co.uk/aa8b0d33b6d0c2ff8fa26f15cd42632d8a251a66/0_151_3000_1800/500.jpg",
    "minute-us" ->
      "https://media.guim.co.uk/dc41d329183de03943d483df5e68f91a0f263a4e/0_0_5000_3000/500.jpg",
    "best-of-opinion" ->
      "https://uploads.guim.co.uk/2023/08/10/Opinion_UK_-_1_-_5-3.jpg",
    "best-of-opinion-us" ->
      "https://uploads.guim.co.uk/2023/08/10/Opinion_US_1_-_america_-_5-3.jpg",
    "best-of-opinion-au" ->
      "https://uploads.guim.co.uk/2023/08/10/Opinion_-_1_-_australia_-_5-3.jpg",
    "this-is-europe" ->
      "https://media.guim.co.uk/0f029b430f0ce52d3e675b66dcfd7e9b86bf2b9b/0_1_1250_750/500.jpg",
    "patriarchy" ->
      "https://media.guim.co.uk/3cf73e88fb6102bd5dae53f58916e758817070cb/62_784_5052_3032/500.jpg",
    "first-dog" ->
      "https://media.guim.co.uk/c58a6d24a640b81ab989f1902ae46bbb1f445291/0_0_1637_982/500.jpg",
    "inside-saturday" ->
      "https://media.guim.co.uk/8b426d79fd6bcd67008b93835a38c8082c03c918/1355_0_3890_2336/500.jpg",
    "the-long-read" ->
      "https://media.guim.co.uk/7a461d62afa662af1b4a5bdc18ba60ba94055138/2083_195_831_499/500.jpg",
    "documentaries" ->
      "https://media.guim.co.uk/d98de55b1ae4c6abf7e9123e641a20df53043a09/6_0_11171_6710/500.png",
    "the-upside" ->
      "https://media.guim.co.uk/5e6fdae101a803bdc0da7e291ff09d2a31246aca/0_0_3835_2301/500.png",
    "her-stage" ->
      "https://media.guim.co.uk/ac76c22d0c5bc36ac6d3ea963cb79e7b9005672a/0_0_1896_1138/500.png",
    "five-great-reads" ->
      "https://media.guim.co.uk/d86eb855a97baeeae3df6d8c6290e9a6d3414cb3/0_0_1520_912/500.jpg",
    "the-guide-staying-in" ->
      "https://media.guim.co.uk/ce2e59cfa2ab7db34cba24adbf20910976e55604/0_0_760_456/500.jpg",
    "pushing-buttons" ->
      "https://media.guim.co.uk/31e53ce199eb1e259743aef44c6bf8caa19c9486/0_0_1273_764/500.jpg",
    "film-today" ->
      "https://media.guim.co.uk/67fed3b1068487f67df01309c30676976565e408/0_0_3999_2400/500.jpg",
    "sleeve-notes" ->
      "https://media.guim.co.uk/a5f8b540c42541002fd726b2ecc0c9a931304974/0_0_2496_1498/500.jpg",
    "bookmarks" ->
      "https://media.guim.co.uk/bd33b2efd56427f05252ea4001b2a45cc63d38d5/1826_0_1399_840/500.png",
    "hear-here" ->
      "https://media.guim.co.uk/798a7909ad0ed5fa710a99b150ffa717ed1d6441/0_0_1787_1072/500.png",
    "art-weekly" ->
      "https://media.guim.co.uk/e6ee88c4b60cd6fd315fb472beb8989920dd59a9/7_231_882_529/500.jpg",
    "design-review" ->
      "https://media.guim.co.uk/550a1b912dad74e92a80af72ec2b3ccdb7bf7a7e/610_65_4383_2630/500.jpg",
    "whats-on" ->
      "https://media.guim.co.uk/f1a5b65778882bd256d16f33149101435a21754e/0_0_1520_912/500.jpg",
    "word-of-mouth" ->
      "https://uploads.guim.co.uk/2023/08/10/Word_of_Mouth.png",
    "fashion-statement" ->
      "https://media.guim.co.uk/12c671d139fa632a086b16c6f14d5b89e3112b42/0_0_760_456/500.jpg",
    "house-to-home" ->
      "https://media.guim.co.uk/7a940ce2e491a2ed91c4b9934448d1c6d0b16f7a/0_0_760_456/500.jpg",
    "guardian-traveller" ->
      "https://media.guim.co.uk/37fac2a9912163428c5abc53bd825e92660dcf01/0_0_760_456/500.png",
    "saved-for-later" ->
      "https://media.guim.co.uk/2a79876d0ea1f3a79f74deff8e9def3471b52daa/0_0_5906_3544/500.jpg",
    "observer-food" ->
      "https://media.guim.co.uk/5d7b82bd2ca772100d9517cfd2160008d03c7cb5/0_33_6048_3999/500.jpg",
    "tokyo-2020-daily-briefing" ->
      "https://media.guim.co.uk/ba57671caf480cbc5627225f10b739e972043c96/0_0_760_456/500.jpg",
    "the-recap" ->
      "https://media.guim.co.uk/0d97a57012a0057079ec1450a7db964eb0e474a8/0_0_5000_3000/500.jpg",
    "the-fiver" ->
      "https://media.guim.co.uk/6cc094739caf19c7ac79f2f7159dd5024814e6a0/0_0_760_456/500.jpg",
    "the-breakdown" ->
      "https://media.guim.co.uk/c091ed39a59fb41a4d4a7b377884b95c21de212f/0_0_5000_3000/500.jpg",
    "the-spin" ->
      "https://media.guim.co.uk/84d633acdddff5ac4b4637e0113ea71859c5df48/0_0_5000_3000/500.jpg",
    "moving-the-goalposts" ->
      "https://media.guim.co.uk/6c3d4ac41a205fed233624415dd05e684ee661b2/0_0_1508_905/500.png",
    "sports-au" ->
      "https://media.guim.co.uk/adb3492ff7dd7779fb26b493870aec13c2a702e7/0_0_5000_3000/500.jpg",
    "cotton-capital" ->
      "https://media.guim.co.uk/c44095c1ce6f2c420a9bbdb5c3dafb5323e1189f/0_0_2560_1536/1000.jpg",
    "soccer-with-jonathan-wilson" ->
      "https://uploads.guim.co.uk/2023/08/03/Soccer-v7_5-3.png",
  )

  def get(identityName: String): Option[String] = {
    data.get(identityName)
  }
}
