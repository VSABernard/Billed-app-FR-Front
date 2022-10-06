/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom'
import userEvent from "@testing-library/user-event"
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
  
  afterEach(() => {
    document.body.innerHTML = ""
  })

  //********** TEST EMAIL ICON VERTICAL HIGHLIGHTED
  describe("When I am on NewBill Page", () => {
      test('Then email icon in vertical layout should be highlighted', async () => {
        const emailIcon = screen.getByTestId("icon-mail");
        expect(emailIcon.classList.contains("active-icon")).toBe(true)
      })
    })
    
  //*********** TEST FILE UPLOADED EXTENSION OTHER THAN JPG, JPEG, PNG : DISPLAY ERROR MESSAGE
  describe("When I am on NewBill page and I upload a file with an extension other than jpg, jpeg or png", () => {
    beforeEach(() => {
      const html = NewBillUI()
      document.body.innerHTML = html
  
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "jhondoe@mail.com",
        })
      )
    })
    
    test("Then an error message for the file input should be displayed", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      // PROPOSE THESE BEHAVIORS FOR THE CONSTRUCTION OF THE PAGE
      const newBill = new NewBill({
         document,
         onNavigate,
         store: null,
         bills: bills,
         localStorage: window.localStorage,
      })

      const inputFile = document.querySelector(`input[data-testid="file"]`)
      const error = screen.getByTestId('error')

      // MOCK THE CALLED FUNCTION
      const onFileChange = jest.fn((e) => newBill.handleChangeFile(e))

      const filePDF = new File(['img'], 'test.pdf', { type: 'text/png' })

      const extension = /([a-z 0-9])+(.jpg|.jpeg|.png)/gi

      inputFile.addEventListener('change', onFileChange)
      userEvent.upload(inputFile, filePDF)

      expect(onFileChange).toHaveBeenCalled()
      expect(inputFile.files[0]).toStrictEqual(filePDF)
      expect(inputFile.files[0].name).not.toMatch(extension)
      expect(error).toBeTruthy()
    })
  })


  //*********** TEST FILE UPLOADED EXTENSION ON JPG, JPEG, PNG : NO ERROR MESSAGE
  describe("When I am on NewBill page and I upload a file with an extension jpg, jpeg or png", () => {
    beforeEach(() => {
      const html = NewBillUI()
      document.body.innerHTML = html
          Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "jhondoe@mail.com",
        })
      )
    })

    test('Then no error message should be displayed', () => {
      const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({ pathname })
      }

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
      const fileInput = document.querySelector(`input[data-testid="file"]`)
      fileInput.addEventListener('change', handleChangeFileMock)

      const eventLoadFilePNG = {
        target: {files: [new File(['...'], 'test.jpg', {type: 'image/jpeg'})],},
      }
      fireEvent.change(fileInput, eventLoadFilePNG)

      expect(handleChangeFileMock).toHaveBeenCalled()

      expect(fileInput.files[0].name).toBe('test.jpg')

      const errorMessage = screen.getByTestId('error')

      expect(errorMessage.classList.contains('active')).toBeFalsy()
    })
  })
})

//************ TEST INTEGRATION POST

describe('Given I am connected as an employéé', () => {
 
  //************* TEST A VALID SUBMIT FORM HAVE BEEN ADDED
  describe('When I am on NewBill page and submit a valid form', () => {    
    test('Then a new bill should have been added', async() => {
      
    })
  })

  //************* TEST A NON VALID FORM SUBMITED THEN AN ERROR MSG DISPLAYED
  describe('When I am on NewBill page and submit a non valid form', () => {  
    test("Then an error message should be displayed", async () => {
      
    })
  })

  

})
