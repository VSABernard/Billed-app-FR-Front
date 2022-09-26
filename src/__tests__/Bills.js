/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import '@testing-library/jest-dom/extend-expect'
import {fireEvent, getAllByTestId, screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from '../__mocks__/store'
import router from "../app/Router.js";
import Bills from '../containers/Bills.js'

jest.mock('../app/store', () => mockStore)

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
    //************** TEST FUNCTION HANDLECLICKONEYE

    describe("When I click on iconEye", () => {
      test("Then modal file should be open", async () => {
      // HTML construction
      document.body.innerHTML = BillsUI({ data: bills })

      // MOCK STORE
      const store = null

      // BEHAVIOURS
      const billsList = new Bills({
         document,
         onNavigate,
         store,
         localStorage: window.localStorage,
       })

      //MOCK MODAL
      $.fn.modal = jest.fn()
      const eye = screen.getAllByTestId("icon-eye")[0]
      const handleClickIconEye = jest.fn(() =>
        billsList.handleClickIconEye(eye)
      )

      eye.addEventListener("click", handleClickIconEye)
      fireEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()
      
      await waitFor(() => screen.getByRole('dialog'))
      const modal = screen.getByRole('dialog')
      expect(modal).toHaveClass('show')

      })
    })

    //************** TEST FUNCTION HANDLECLICKNEWBILL

    describe("When I click on button : Add new bill", () => {
      test("Then page should display form : Send new bill", async () => {

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.NewBill)

        const getBillsToDisplay = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        })

        await waitFor(() => screen.getAllByTestId('btn-new-bill'))

        const btnNewBill = screen.getAllByTestId('btn-new-bill')
        btnNewBill.addEventListener("click", jest.fn(getBillsToDisplay.handleClickNewBill))
        userEvent.click(btnNewBill)
        
        const textSendBill = screen.getByText("Envoyer une note de frais")
        expect(textSendBill).toBe(true)        
      })
    })



  })
})

//**************** TEST D'INTEGRATION GET

// describe("Given I am a user connected as Employee", () => {
//   describe("")
// })
