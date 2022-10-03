/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom'
import '@testing-library/jest-dom'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from '../views/BillsUI.js'
import { ROUTES, ROUTES_PATH } from '../constants/routes.js'
import { localStorageMock } from '../__mocks__/localStorage.js'
import store from "../__mocks__/store"
import mockStore from '../__mocks__/store'
import { bills } from '../fixtures/bills.js'
import router from '../app/Router.js'

jest.mock('../app/store', () => mockStore)


describe("Given I am connected as an employee", () => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })

  window.localStorage.setItem(
    'user',
    JSON.stringify({
      type: 'Employee',
    })
  )

  document.body.innerHTML = `<div id="root"></div>`
  router()

  // THE DOM IS PLACED
  document.body.innerHTML = NewBillUI()

  // THE ROAD TO THE RIGHT PAGE
  window.onNavigate(ROUTES_PATH.NewBill)
  })
  afterEach(() => {
    document.body.innerHTML = ""
  })

  describe("When I am on NewBill Page", () => {
    describe("When I am on NewBill page", () => {

      //********** EMAIL ICON VERTICAL HIGHLIGHTED
      test('Then email icon in vertical layout should be highlighted', async () => {
        const emailIcon = screen.getByTestId("icon-mail");
        expect(emailIcon.classList.contains("active-icon")).toBe(true)
      })
    })

    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      
    })
})

