import sbt.*
import Keys.*
import sbt.internal.util.ManagedLogger

object TestGroupsPlugin extends AutoPlugin {

  object autoImport {
    val testGroups = settingKey[Int]("Number of test groups")
    // TODO hardcoded test group tasks. Make this dynamic
    val runTestGroup1 = taskKey[Unit]("Run test group 1")
    val runTestGroup2 = taskKey[Unit]("Run test group 2")
    val runTestGroup3 = taskKey[Unit]("Run test group 3")
    val runTestGroup4 = taskKey[Unit]("Run test group 4")
    val runTestGroup5 = taskKey[Unit]("Run test group 5")
    val runTestGroup6 = taskKey[Unit]("Run test group 6")
    val runTestGroup7 = taskKey[Unit]("Run test group 7")
    val runTestGroup8 = taskKey[Unit]("Run test group 8")
    val runTestGroup9 = taskKey[Unit]("Run test group 9")
    val runTestGroup10 = taskKey[Unit]("Run test group 10")
  }

  private def getTestsByPattern(
                                 tests: collection.Seq[TestDefinition],
                                 pattern: String,
                               ): collection.Seq[TestDefinition] = {
    tests.filter(_.name.contains(pattern)).map { test =>
    {
      println(s"Checking $name")
      new TestDefinition(
        test.name,
        test.fingerprint,
        test.explicitlySpecified,
        test.selectors,
      )
    }
    }
  }

  private def getTestsByGroup(
                               tests: collection.Seq[TestDefinition],
                               groupSize: Int,
                               group: Int,
                             ): collection.Seq[TestDefinition] = {
    // split the tests into groups of size groupSize and return the requested group
    val segmentSize = (tests.size + groupSize - 1) / groupSize // ceiling division
    val segment = tests.grouped(segmentSize).toSeq.lift(group - 1).getOrElse(Seq.empty)
    segment.map { test =>
      new TestDefinition(
        s"'${test.name}'",
        test.fingerprint,
        test.explicitlySpecified,
        test.selectors,
      )
    }
  }

  private def logTests(
                        log: ManagedLogger,
                        tests: Seq[TestDefinition],
                        filteredTests: Seq[TestDefinition],
                        groupSize: Int,
                        group: Int,
                      ): Unit = {
    val GREEN = "\u001B[92m"
    val RESET = "\u001B[0m"
    log.info(s"=====================================")
    log.info(s"Test grouping")
    log.info(s"=====================================")
    log.info(s"All tests      : ${tests.size}")
    log.info(s"Group          : $group / $groupSize")
    log.info(s"Tests in group : ${filteredTests.size}")
    log.info(s"========")
    log.info(s"Tests (${tests.size})")
    log.info(s"Tests in group (${filteredTests.size}) denoted by *")
    log.info(
      tests.zipWithIndex
        .map { case (t, i) =>
          val isInGroup = filteredTests.exists(_.name == t.name)
          val prefix = if (isInGroup) s"$GREEN* " else s"  "
          val numberWithPadding = s"${i + 1}.".padTo(5, ' ')
          s"$prefix$numberWithPadding${t.name}$RESET"
        }
        .mkString("\n"),
    )
    log.info(s"=====================================")
  }

  private def createTestGroupTask(groupSize: sbt.SettingKey[Int], group: Int) = Def.taskDyn {
    val tests = (Test / definedTests).value.sortBy(_.name)
    val groupSizeValue = groupSize.value
    val log = streams.value.log
    val filteredTests = getTestsByGroup(tests, groupSizeValue, group)
    logTests(log, tests, filteredTests, groupSizeValue, group)
    if (filteredTests.isEmpty) {
      log.warn("No filtered tests found")
      Def.task(())
    } else {
      (Test / testOnly).toTask(filteredTests.map(" " + _.name).mkString)
    }
  }

  import autoImport._

  override lazy val projectSettings = Seq(
    // Default test groups. Can be overridden by individual project settings in build.sbt
    testGroups := 2,
    // TODO hardcoded test group tasks. Make this dynamic
    runTestGroup1 := createTestGroupTask(testGroups, 1).value,
    runTestGroup2 := createTestGroupTask(testGroups, 2).value,
    runTestGroup3 := createTestGroupTask(testGroups, 3).value,
    runTestGroup4 := createTestGroupTask(testGroups, 4).value,
    runTestGroup5 := createTestGroupTask(testGroups, 5).value,
    runTestGroup6 := createTestGroupTask(testGroups, 6).value,
    runTestGroup7 := createTestGroupTask(testGroups, 7).value,
    runTestGroup8 := createTestGroupTask(testGroups, 8).value,
    runTestGroup9 := createTestGroupTask(testGroups, 9).value,
    runTestGroup10 := createTestGroupTask(testGroups, 10).value,
  )
}
