package controllers

import common.ExecutionContexts
import conf.switches.Switches
import play.api.mvc.{Action, Controller}
import sudoku.{SudokuPage, SudokuApi}
import views.html.sudoku

import scala.concurrent.Future

object SudokusController extends Controller with ExecutionContexts {
  def render(id: String) = Action.async { implicit request =>
    if (Switches.SudokuSwitch.isSwitchedOn) {
      SudokuApi.getData(id) map {
        case Some(sudokuData) =>
          Ok(sudoku(new SudokuPage(sudokuData)))

        case None => NotFound(s"No Sudoku with id $id")
      }
    } else {
      Future.successful(NotFound("Sudokus off"))
    }
  }
}
