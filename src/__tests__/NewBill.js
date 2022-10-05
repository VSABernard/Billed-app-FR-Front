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

      //********** TEST EMAIL ICON VERTICAL HIGHLIGHTED
      test('Then email icon in vertical layout should be highlighted', async () => {
        const emailIcon = screen.getByTestId("icon-mail");
        expect(emailIcon.classList.contains("active-icon")).toBe(true)
      })
    })

  describe("When I am on NewBill Page and I upload a file with an extension other than jpg, jpeg or png", () => {
    
    //*********** TEST FILE UPLOADED EXTENSION OTHER THAN JPG, JPEG, PNG : DISPLAY ERROR MESSAGE
    test("Then an error message for the file input should be displayed", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      // PROPOSE THESE BEHAVIORS FOR THE CONSTRUCTION OF THE PAGE
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      })

      // MOCK THE CALLED FUNCTION
      const handleChangeFileMock = jest.fn((e) => newBill.handleChangeFile(e))

      // RETRIEVE THE INPUT OF THE FILE TO ADD
      const fileInput = screen.getByTestId('file')
      fileInput.addEventListener('change', handleChangeFileMock)

      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(['test'], 'test.pdf', {
              type: 'application/pdf',
            }),
          ],
        },
      })

      expect(handleChangeFileMock).toHaveBeenCalled()

      expect(fileInput.files[0].name).toBe('test.pdf')

      const errorMessage = screen.getByTestId('error')

      expect(errorMessage).not.toHaveClass('hidden')
    })

    //*********** TEST FILE UPLOADED EXTENSION OTHER THAN JPG, JPEG, PNG : NO ERROR MESSAGE
    test('Then no error message should be displayed', () => {
      document.body.innerHTML = NewBillUI()

      // PROPOSE THESE BEHAVIORS FOR THE CONSTRUCTION OF THE PAGE
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        bills: bills,
        localStorage: window.localStorage,
      })

      // MOCK THE CALLED FUNCTION
      const handleChangeFileMock = jest.fn((e) => newBill.handleChangeFile(e))

      // RETRIEVE THE INPUT OF THE FILE TO ADD
      const fileInput = screen.getByTestId('file')
      fileInput.addEventListener('change', handleChangeFileMock)

      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(['test'], 'test.jpg', {
              type: 'image/jpeg',
            }),
          ],
        },
      })

      expect(handleChangeFileMock).toHaveBeenCalled()

      expect(fileInput.files[0].name).toBe('test.jpg')

      const errorMessage = screen.getByTestId('error')

      expect(errorMessage.classList.contains('active')).toBeFalsy()
    })
})

//************ TEST INTEGRATION POST

describe('Given I am connected as an employéé', () => {
  describe('When I am on NewBill page and submit a valid form', () => {
    test('Then a new bill should have been added', async() => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })

      const inputName = screen.getByTestId("expense-name")
      fireEvent.change(inputName, { target: { value: "Achat bureau" } })
      const inputAmount = screen.getByTestId("amount")
      fireEvent.change(inputAmount, { target: { value: "175" } })
      const inputDate = screen.getByTestId("datepicker")
      fireEvent.change(inputDate, { target: { value: new Date() } })
      const inputPct = screen.getByTestId("pct")
      fireEvent.change(inputPct, { target: { value: "25" } })
      const inputFile = document.querySelector(`input[data-testid="file"]`)
      const eventLoadFilePNG = {
        target: {
          files: [new File(["..."], "test.png", { type: "document/png" })],
        },
      }
      fireEvent.change(inputFile, eventLoadFilePNG)

      const submitNewBill = jest.fn(newBill.handleSubmit)
      const form = screen.getByTestId("form-new-bill")

      form.addEventListener("submit", submitNewBill)
      fireEvent.submit(form)

      expect(submitNewBill).toHaveBeenCalled()
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
    })
  })
})

