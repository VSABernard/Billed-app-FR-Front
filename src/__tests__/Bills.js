/**
 * @jest-environment jsdom
 */

import {getAllByTestId, screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      
      //************** TO-DO WRITE EXPECT EXPRESSION
      // active-icon : HIGHLIGHTED AN ICON (layout.css -> ligne 42)
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      
      //*****************BUG EMPLOYEE (SORT DATES) : line 36 "((a < b) ? 1 : -1)" BECOMES "(a.date - b.date)"
      const antiChrono = (a, b) => (a.date - b.date)

      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    //*********** NEW TESTS
    describe("When I click on iconEye", () => {
    
    //************** TEST FUNCTION HANDLECLICKONEYE
      test("Then modale file should be open", async () => {

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        await waitFor(() => screen.getAllByTestId('icon-eye'))
        const eyeIcons = screen.getAllByTestId('icon-eye')
        
        expect(eyeIcons.length).toEqual(4)

        userEvent.click(
          eyeIcons[0]
        )
        const modaleFile = document.querySelector('#modaleFile')
        expect(modaleFile.classList.contains('show')).toBe(true)

        
      })


    })
  })
})

//**************** TEST D'INTEGRATION GET

// describe("Given I am a user connected as Employee", () => {
//   describe("")
// })
