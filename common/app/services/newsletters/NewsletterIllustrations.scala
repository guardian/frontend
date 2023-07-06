package services.newsletters

object newsletterIllustrations {

  private val data: Map[String, String] = Map.apply(
    "morning-briefing" ->
      "https://i.guim.co.uk/img/media/77074f52e5e6f22a6636ed10d65a421426490c9e/22_0_4747_2849/500.png?width=250&quality=45&s=4013e217a49beab11919de5b9e07a4a5",
    "us-morning-newsletter" ->
      "https://i.guim.co.uk/img/media/035de4d15b7732659f574547e7cc68199c29432a/0_0_5000_3000/500.jpg?width=250&quality=45&s=5319289e84bf8248a3b75de85b947401",
    "morning-mail" ->
      "https://i.guim.co.uk/img/media/4cf911dd7c5cf23e4c67f0951ec39dc99f6cbc9a/0_0_1240_744/500.jpg?width=250&quality=45&s=238c865b55b4a60818b09b70f709303f",
    "afternoon-update" ->
      "https://i.guim.co.uk/img/media/50b02d4e4a32def95d8d26cc852549e6bd83f037/0_0_1850_1111/500.jpg?width=250&quality=45&s=6325bb62e51f4af4d43e8bafb28b3e6d",
    "green-light" ->
      "https://i.guim.co.uk/img/media/bf9a946c2bdd8011c098dfa9e8c91a94d033170f/0_0_1000_600/500.jpg?width=250&quality=45&s=28351eec6427ae3f8a4e6dc64ac38007",
    "tech-scape" ->
      "https://i.guim.co.uk/img/media/e4b75f936694609cff24a4a440ec07a87bc2e274/8_0_2258_1356/500.jpg?width=250&quality=45&s=36fa8941658accc6cdb5a481a779c087",
    "the-rural-network" ->
      "https://i.guim.co.uk/img/media/23ab4cead66f6e7fcf85b2b0f97faa9fae606858/0_275_4288_2573/500.jpg?width=250&quality=45&s=2d6e3dea809f9019ac7272cc3e5c4921",
    "today-uk" ->
      "https://i.guim.co.uk/img/media/b1e1d07a6c5645eff768afb0c2dc5eb915817cf0/1_0_5021_3014/500.png?width=250&quality=45&s=a82d74a2904598782d5dd249d860242c",
    "today-us" ->
      "https://i.guim.co.uk/img/media/d30b5b560d10e8bd429c848a3a6668787d88f716/2_0_5434_3262/500.png?width=250&quality=45&s=d6a46052173f521aa3986136c428163d",
    "today-au" ->
      "https://i.guim.co.uk/img/media/c95f590baa23c75de13686356f12ad0b59575a72/2_0_6221_3734/500.png?width=250&quality=45&s=82f88f7ce3715ab1dccde4bd4063d323",
    "australian-politics" ->
      "https://i.guim.co.uk/img/media/f55f510293ee713ffcc9e48d1f420d4b2769ea49/0_0_5472_3648/500.jpg?width=250&quality=45&s=fa2be1b3db7ba2065959f0e3babef546",
    "global-dispatch" ->
      "https://i.guim.co.uk/img/media/28ffd9cfbf7125265a79a664afacea6444c19cf1/0_0_2560_1536/500.jpg?width=250&quality=45&s=58da4319f10510a0b374324a928b766b",
    "business-today" ->
      "https://i.guim.co.uk/img/media/aa8b0d33b6d0c2ff8fa26f15cd42632d8a251a66/0_151_3000_1800/500.jpg?width=250&quality=45&s=e5d8298adae28ef97fbae18cde3f548b",
    "minute-us" ->
      "https://i.guim.co.uk/img/media/dc41d329183de03943d483df5e68f91a0f263a4e/0_0_5000_3000/500.jpg?width=250&quality=45&s=419ffb0a03b5f5c9cef62cd80c52053e",
    "best-of-opinion" ->
      "https://i.guim.co.uk/img/media/4ef30ca444a6980ad09f9c651b620000ede91d68/2943_7_2997_1798/500.png?width=250&quality=45&s=d403a4598a34e4c705513e157b4cdefb",
    "best-of-opinion-us" ->
      "https://i.guim.co.uk/img/media/4ef30ca444a6980ad09f9c651b620000ede91d68/3623_5_3289_1976/500.png?width=250&quality=45&s=698ab2c29ad2f9163683dbeeb7990f18",
    "best-of-opinion-au" -> "",
    "this-is-europe" ->
      "https://i.guim.co.uk/img/media/0f029b430f0ce52d3e675b66dcfd7e9b86bf2b9b/0_1_1250_750/500.jpg?width=250&quality=45&s=971ab7ce3906642fa0582864443d3b06",
    "patriarchy" ->
      "https://i.guim.co.uk/img/media/3cf73e88fb6102bd5dae53f58916e758817070cb/62_784_5052_3032/500.jpg?width=250&quality=45&s=3c6e7b89bdeea41918e9881c821260a3",
    "first-dog" ->
      "https://i.guim.co.uk/img/media/c58a6d24a640b81ab989f1902ae46bbb1f445291/0_0_1637_982/500.jpg?width=250&quality=45&s=93fd2aeeb3c31c89ad9302afb7fba5af",
    "inside-saturday" ->
      "https://i.guim.co.uk/img/media/8b426d79fd6bcd67008b93835a38c8082c03c918/1355_0_3890_2336/500.jpg?width=250&quality=45&s=c42a70edf8e37c41b35574abf1c8905a",
    "the-long-read" ->
      "https://i.guim.co.uk/img/media/7a461d62afa662af1b4a5bdc18ba60ba94055138/2083_195_831_499/500.jpg?width=250&quality=45&s=6509f225223c4a196ce3e8e439cc2c76",
    "documentaries" ->
      "https://i.guim.co.uk/img/media/d98de55b1ae4c6abf7e9123e641a20df53043a09/6_0_11171_6710/500.png?width=250&quality=45&s=b85bc7cab25ae96ac01949d336f49f7d",
    "the-upside" ->
      "https://i.guim.co.uk/img/media/5e6fdae101a803bdc0da7e291ff09d2a31246aca/0_0_3835_2301/500.png?width=250&quality=45&s=e0276a6169c6ade29278755f02211c2b",
    "her-stage" ->
      "https://i.guim.co.uk/img/media/ac76c22d0c5bc36ac6d3ea963cb79e7b9005672a/0_0_1896_1138/500.png?width=250&quality=45&s=393db5d0dee0e837cac7b8ea0e22a320",
    "five-great-reads" ->
      "https://i.guim.co.uk/img/media/d86eb855a97baeeae3df6d8c6290e9a6d3414cb3/0_0_1520_912/500.jpg?width=250&quality=45&s=3be432d4bacf509915bfad61546488b1",
    "the-guide-staying-in" ->
      "https://i.guim.co.uk/img/media/ce2e59cfa2ab7db34cba24adbf20910976e55604/0_0_760_456/500.jpg?width=250&quality=45&s=fe7613b0b0d0c2309dd42b521be95aa9",
    "pushing-buttons" ->
      "https://i.guim.co.uk/img/media/31e53ce199eb1e259743aef44c6bf8caa19c9486/0_0_1273_764/500.jpg?width=250&quality=45&s=29a587c166d6fe047a1a1bd9caa078f9",
    "film-today" ->
      "https://i.guim.co.uk/img/media/67fed3b1068487f67df01309c30676976565e408/0_0_3999_2400/500.jpg?width=250&quality=45&s=91d81e2913592b4690730953863d6b5a",
    "sleeve-notes" ->
      "https://i.guim.co.uk/img/media/a5f8b540c42541002fd726b2ecc0c9a931304974/0_0_2496_1498/500.jpg?width=250&quality=45&s=23d58b3391fc6a0e7a185ea30418dda2",
    "bookmarks" ->
      "https://i.guim.co.uk/img/media/bd33b2efd56427f05252ea4001b2a45cc63d38d5/1826_0_1399_840/500.png?width=250&quality=45&s=1f0df056a61bfb322e8756806de2890a",
    "hear-here" ->
      "https://i.guim.co.uk/img/media/798a7909ad0ed5fa710a99b150ffa717ed1d6441/0_0_1787_1072/500.png?width=250&quality=45&s=d1762d8dd3f198f27970314b8eff0cfb",
    "art-weekly" ->
      "https://i.guim.co.uk/img/media/e6ee88c4b60cd6fd315fb472beb8989920dd59a9/7_231_882_529/500.jpg?width=250&quality=45&s=647a1933feb0e84960b7c813a663427b",
    "design-review" ->
      "https://i.guim.co.uk/img/media/550a1b912dad74e92a80af72ec2b3ccdb7bf7a7e/610_65_4383_2630/500.jpg?width=250&quality=45&s=6c4af246931aab967eb0898b651c530c",
    "whats-on" ->
      "https://i.guim.co.uk/img/media/f1a5b65778882bd256d16f33149101435a21754e/0_0_1520_912/500.jpg?width=250&quality=45&s=8839096ef48016c3921c71f3bc7e0ae6",
    "word-of-mouth" ->
      "https://i.guim.co.uk/img/media/763740b8e350cea9a3e28e262f29894d3e9da140/0_0_4200_2521/500.jpg?width=250&quality=45&s=e7564a77ee1465803a3ee3b355e5b518",
    "fashion-statement" ->
      "https://i.guim.co.uk/img/media/12c671d139fa632a086b16c6f14d5b89e3112b42/0_0_760_456/500.jpg?width=250&quality=45&s=11bbf544439c9a62be1a6800ee4a07bc",
    "house-to-home" ->
      "https://i.guim.co.uk/img/media/7a940ce2e491a2ed91c4b9934448d1c6d0b16f7a/0_0_760_456/500.jpg?width=250&quality=45&s=9b357e4a436fb2292674f05071af34b6",
    "guardian-traveller" ->
      "https://i.guim.co.uk/img/media/37fac2a9912163428c5abc53bd825e92660dcf01/0_0_760_456/500.png?width=250&quality=45&s=0eeb91d046588acbfa14eedbf75d38d2",
    "saved-for-later" ->
      "https://i.guim.co.uk/img/media/2a79876d0ea1f3a79f74deff8e9def3471b52daa/0_0_5906_3544/500.jpg?width=250&quality=45&s=f112040b1166eedb5c34fbc69c4bf5d0",
    "observer-food" ->
      "https://i.guim.co.uk/img/media/5d7b82bd2ca772100d9517cfd2160008d03c7cb5/0_33_6048_3999/500.jpg?width=250&quality=45&s=962f308c8186ab2ab85c28a034c81352",
    "tokyo-2020-daily-briefing" ->
      "https://i.guim.co.uk/img/media/ba57671caf480cbc5627225f10b739e972043c96/0_0_760_456/500.jpg?width=250&quality=45&s=12e1c17e31872a3a6e950ae5e362e2a3",
    "the-recap" ->
      "https://i.guim.co.uk/img/media/0d97a57012a0057079ec1450a7db964eb0e474a8/0_0_5000_3000/500.jpg?quality=45&width=250&s=538f7fbb6a696229db9aa0335fa6782c",
    "the-fiver" ->
      "https://i.guim.co.uk/img/media/6cc094739caf19c7ac79f2f7159dd5024814e6a0/0_0_760_456/500.jpg?quality=45&width=250&s=ca961cd26312f691bd2de766edc40137",
    "the-breakdown" ->
      "https://i.guim.co.uk/img/media/c091ed39a59fb41a4d4a7b377884b95c21de212f/0_0_5000_3000/500.jpg?quality=45&width=250&s=c03faff55a2cb8ce080b57bb3f18bd80",
    "the-spin" ->
      "https://i.guim.co.uk/img/media/84d633acdddff5ac4b4637e0113ea71859c5df48/0_0_5000_3000/500.jpg?quality=45&width=250&s=da0cbb76dc81f05121d1c04818a00b5c",
    "moving-the-goalposts" ->
      "https://i.guim.co.uk/img/media/6c3d4ac41a205fed233624415dd05e684ee661b2/0_0_1508_905/500.png?quality=45&width=250&s=2b83f52d531af625e6bd5ed964c9d41d",
    "sports-au" ->
      "https://i.guim.co.uk/img/media/adb3492ff7dd7779fb26b493870aec13c2a702e7/0_0_5000_3000/500.jpg?width=250&quality=&s=48cca9c0a5e2fe34fd3b2ac2ba87d849",
    "cotton-capital" ->
      "https://i.guim.co.uk/img/media/c44095c1ce6f2c420a9bbdb5c3dafb5323e1189f/0_0_2560_1536/master/2560.jpg?width=250&quality=45&dpr=2&s=none&s=9b9ef968114be19c21986fac71c61bc2",
  )

  def get(identityName: String): Option[String] = {
    data.get(identityName)
  }
}
