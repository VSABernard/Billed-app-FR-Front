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
  })

  //*********** NEW TESTS
  //************** TEST FUNCTION HANDLECLICKICONEYE

  describe("When I am on Bills page and I click on iconEye", () => {
    test("Then a modal file should be open", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
        document.body.innerHTML = BillsUI({ data: bills })
      const billPage = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })
      
      // CREATE A MOCK FUNCTION FOR MODAL

      $.fn.modal = jest.fn() 

      const btnEye = screen.getAllByTestId("icon-eye")      // icon-eye IS AN ARRAY

      // MOCK DE LA fn
      const handleClickIconEye = jest.fn((eyeBTN) => {
        billPage.handleClickIconEye(eyeBTN)
      })
        btnEye.forEach((elt) => {
        // EVENEMENT SUR CHAQUE ELEMENT DE L'ARRAY
        elt.addEventListener("click", () => handleClickIconEye(elt))
        userEvent.click(elt)
      })
        expect(handleClickIconEye).toHaveBeenCalled()
      expect(screen.getByText("Justificatif")).toBeTruthy()
    })
  })

  //************** TEST FUNCTION HANDLECLICKNEWBILL

  describe("When I am on Bills page and I click on button : Add new bill", () => {
    test("Then I should be send on a New Bill page", async () => {
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
        bills: bills,
        localStorage: window.localStorage,
      })
      await waitFor(() => screen.getByText('Nouvelle note de frais'))
      const btnNewBill = screen.getByText('Nouvelle note de frais')
      btnNewBill.addEventListener("click", jest.fn(getBillsToDisplay.handleClickNewBill))
      userEvent.click(btnNewBill)
      
      const textSendBill = screen.getByText('Envoyer une note de frais')
      expect(textSendBill).toBeTruthy()        
    })
  })

  //**************** TEST LOADER

  describe("When I am on Bills page but it is loading", () => {
    test("Then the loader should be rendered", async () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

//******************* TEST ERROR MESSAGE

  describe("When I navigate to Bills but an error message is shown", () => {
      test('Then, Error page should be rendered', () => {
        document.body.innerHTML = BillsUI({ error: 'some error message' })
        expect(screen.getAllByText('Erreur')).toBeTruthy()
        document.body.innerHTML = ""
      })
    })
})

  //**************** TEST D'INTEGRATION GET

describe("Given I am a user connected as Employee", () => {

  //*************** TEST FETCH BILLS FROM API GET

  describe('When I navigate to Bills Page', () => {
    test('Then the bills are fetched from the simulated API GET', async () => {
      localStorage.setItem(
        'user',
        JSON.stringify({ type: 'Employee', email: 'a@a' })
      )

      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText('Mes notes de frais'))
      const newBillButton = screen.getByText('Nouvelle note de frais')
      expect(newBillButton).toBeTruthy()
    })
  })

  //**************** TEST ERRORS ON API

  describe('When an error occurs on API', () => {
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills')
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a',
        })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.appendChild(root)
      router()
    })

    //*************** TEST ERROR 404

    test('fetches bills from an API and fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 404'))
          },
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
      })
  
    //*************** TEST ERROR 500
  
    test('fetches messages from an API and fails with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error('Erreur 500'))
          },
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
      })
  })
})
