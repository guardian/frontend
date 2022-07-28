package experiments

import conf.switches.Owner

import java.time.LocalDate
import org.scalatest.matchers.should.Matchers
import test.TestRequest
import ParticipationGroups._
import org.scalatest.flatspec.AnyFlatSpec
import play.api.mvc.RequestHeader

class ExperimentsTest extends AnyFlatSpec with Matchers {

  conf.switches.Switches.ServerSideExperiments.switchOn

  "Experiments" should "not share participation group" in {
    ActiveExperiments.allExperiments.size should be(ActiveExperiments.allExperiments.map(_.participationGroup).size)
  }

  "a experiment" should "have a default switch state to off" in {
    TestCases.experiment0.switch.isSwitchedOff should be(true)
  }

  "A experiment" should "know if a given request is participating" in EnabledExperiments {
    val testRequest = TestRequest("/uk")
      .withHeaders(
        TestCases.experiment1.participationGroup.headerName -> "variant",
      )
    AllExperiments.isParticipating(TestCases.experiment0)(testRequest) should be(false)
    AllExperiments.isParticipating(TestCases.experiment1)(testRequest) should be(true)
    AllExperiments.isParticipating(TestCases.experiment2)(testRequest) should be(false)
  }

  "A experiment" should "know if a given request is in control group" in EnabledExperiments {
    val testRequest = TestRequest("/uk")
      .withHeaders(
        TestCases.experiment0.participationGroup.headerName -> "control",
      )
    AllExperiments.isControl(TestCases.experiment0)(testRequest) should be(true)
    AllExperiments.isControl(TestCases.experiment1)(testRequest) should be(false)
    AllExperiments.isControl(TestCases.experiment2)(testRequest) should be(false)
  }

  "A experiment" should "run if prior condition is met" in EnabledExperiments {
    val testRequest = TestRequest("/uk")
      .withHeaders(
        TestCases.experimentWithTruePriorCondition.participationGroup.headerName -> "variant",
      )
    AllExperiments.isParticipating(TestCases.experimentWithTruePriorCondition)(testRequest) should be(true)
  }
  "A experiment" should "not run if prior condition is not met" in EnabledExperiments {
    val testRequest = TestRequest("/uk")
      .withHeaders(
        TestCases.experimentWithFalsePriorCondition.participationGroup.headerName -> "variant",
      )
    AllExperiments.isParticipating(TestCases.experimentWithFalsePriorCondition)(testRequest) should be(false)
  }

  "A experiment" should "not run if extra header value doesn't match" in EnabledExperiments {
    val testRequest = TestRequest("/uk")
      .withHeaders(
        TestCases.experimentWithExtraHeader.participationGroup.headerName -> "variant",
      )
    AllExperiments.isParticipating(TestCases.experimentWithExtraHeader)(testRequest) should be(false)
  }
  "A experiment" should "only run if extra header value matches" in EnabledExperiments {
    val testRequest = TestRequest("/uk")
      .withHeaders(
        TestCases.experimentWithExtraHeader.participationGroup.headerName -> "variant",
        TestCases.experimentWithExtraHeader.extraHeader.get.key -> TestCases.experimentWithExtraHeader.extraHeader.get.value,
      )
    AllExperiments.isParticipating(TestCases.experimentWithExtraHeader)(testRequest) should be(true)
  }

  "Javascript config" should "contains correct experiment values" in EnabledExperiments {
    val testRequest = TestRequest("/myPage")
      .withHeaders(
        TestCases.experiment1.participationGroup.headerName -> "variant",
        TestCases.experiment2.participationGroup.headerName -> "control",
      )
    val jsConfig = AllExperiments.getJavascriptConfig(testRequest)
    jsConfig should be(""""experiment1Variant":"variant","experiment2Control":"control"""")

  }

  "Requests that depends on experiments" should "be aware of those experiments" in EnabledExperiments {
    val testRequest = LookedAtExperiments.createRequest(TestRequest("/uk"))
    AllExperiments.isParticipating(TestCases.experiment0)(testRequest)
    AllExperiments.isParticipating(TestCases.experiment1)(testRequest)

    val lookedAtExperiments = LookedAtExperiments.forRequest(testRequest)
    lookedAtExperiments should contain(TestCases.experiment0)
    lookedAtExperiments should contain(TestCases.experiment1)
  }

  "Request that depends on experiments" should "not be aware of experiments with false prior condition" in EnabledExperiments {
    val testRequest = LookedAtExperiments.createRequest(TestRequest("/uk"))
    AllExperiments.isParticipating(TestCases.experimentWithFalsePriorCondition)(testRequest)
    LookedAtExperiments.forRequest(testRequest) should not contain (TestCases.experimentWithFalsePriorCondition)
  }

  /*
   * Test Data
   */
  object AllExperiments extends ExperimentsDefinition {
    val allExperiments: Set[Experiment] = TestCases.experiments
    implicit val canCheckExperiment = new CanCheckExperiment(this)
  }

  object TestCases {
    object experiment0
        extends Experiment(
          "experiment0",
          "an experiment",
          Seq(Owner.withName("Fake owner")),
          LocalDate.of(2100, 1, 1),
          participationGroup = Perc0A,
        )
    object experiment1
        extends Experiment(
          "experiment1",
          "another experiment",
          Seq(Owner.withName("Fake owner")),
          LocalDate.of(2100, 1, 1),
          participationGroup = Perc1A,
        )
    object experiment2
        extends Experiment(
          "experiment2",
          "still another experiment",
          Seq(Owner.withName("Fake owner")),
          LocalDate.of(2100, 1, 1),
          participationGroup = Perc1B,
        )
    object experimentWithTruePriorCondition
        extends Experiment(
          "experiment-with-true-prior-condition",
          "an experiment",
          Seq(Owner.withName("Fake owner")),
          LocalDate.of(2100, 1, 1),
          participationGroup = Perc1C,
        ) {
      override def priorCondition(implicit request: RequestHeader): Boolean = true
    }
    object experimentWithFalsePriorCondition
        extends Experiment(
          "experiment-with-false-prior-condition",
          "an experiment",
          Seq(Owner.withName("Fake owner")),
          LocalDate.of(2100, 1, 1),
          participationGroup = Perc1D,
        ) {
      override def priorCondition(implicit request: RequestHeader): Boolean = false
    }
    object experimentWithExtraHeader
        extends Experiment(
          "experiment-with-extra-header",
          "an experiment",
          Seq(Owner.withName("Fake owner")),
          LocalDate.of(2100, 1, 1),
          participationGroup = Perc1E,
        ) {
      override val extraHeader: Option[ExperimentHeader] = Some(ExperimentHeader("extraCond", "true"))
    }

    val experiments = Set(
      experiment0,
      experiment1,
      experiment2,
      experimentWithTruePriorCondition,
      experimentWithFalsePriorCondition,
      experimentWithExtraHeader,
    )
  }

  trait EnabledExperiments {

    def apply[T](block: => T): T = {
      TestCases.experiments.foreach(_.switch.switchOn)
      val result = block
      TestCases.experiments.foreach(_.switch.switchOff)
      result
    }
  }

  object EnabledExperiments extends EnabledExperiments
}
