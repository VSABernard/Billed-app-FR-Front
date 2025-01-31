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

  //********** TEST UNIT : EMAIL ICON VERTICAL HIGHLIGHTED
  describe("When I am on NewBill Page", () => {
      test('Then email icon in vertical layout should be highlighted', async () => {
        const emailIcon = screen.getByTestId("icon-mail");
        expect(emailIcon.classList.contains("active-icon")).toBe(true)
      })
    })
    
  //*********** TEST UNIT : FILE UPLOADED EXTENSION OTHER THAN JPG, JPEG, PNG : DISPLAY ERROR MESSAGE
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
      const errorMessage = screen.getByTestId('error')

      // MOCK THE CALLED FUNCTION
      const onFileChange = jest.fn((e) => newBill.handleChangeFile(e))

      const filePDF = new File(['img'], 'test.pdf', { type: 'text/png' })

      const extension = /([a-z 0-9])+(.jpg|.jpeg|.png)/gi

      inputFile.addEventListener('change', onFileChange)
      userEvent.upload(inputFile, filePDF)

      expect(onFileChange).toHaveBeenCalled()
      expect(inputFile.files[0]).toStrictEqual(filePDF)
      expect(inputFile.files[0].name).not.toMatch(extension)
      expect(errorMessage).not.toHaveClass('hidden')
    })
  })


  //*********** TEST UNIT : FILE UPLOADED EXTENSION ON JPG, JPEG, PNG : NO ERROR MESSAGE
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
      expect(errorMessage.classList).toContain('hidden')
    })
  })
})

//************ TEST INTEGRATION POST

describe('Given I am connected as an employéé and on NewBill page', () => {
  beforeEach(() => {
    const html = NewBillUI()
    document.body.innerHTML = html
    Object.defineProperty(window, "localStorage", {value: localStorageMock})
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
        email: "email@email.com",
      })
    )
  })

  //************* TEST A VALID SUBMIT FORM HAVE BEEN ADDED
  describe('When I submit a valid form', () => {    
    it('Then a new bill should have been added', async() => {
      // AS WE CALL A CLASS WITH PARAMETERS WE CALL THIS CLASS
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })

      // THE DOM'S ELEMENTS
      const formulaire = screen.getByTestId('form-new-bill')
      const inputSelect = screen.getByTestId('expense-type')
      const inputName = screen.getByTestId('expense-name')
      const inputDate = screen.getByTestId('datepicker')
      const inputAmount = screen.getByTestId('amount')
      const inputVAT = screen.getByTestId('vat')
      const inputPCT = screen.getByTestId('pct')
      const inputCom = screen.getByTestId('commentary')
      const inputFile = screen.getByTestId('file')

      const file = new File(['img'], 'bill.jpg', { type: 'image/jpg' })

      // THE EXPECTED FORMAT OF THE FORM
      const formValues = {
        type: 'Fornitures de bureau',
        name: 'Bureau en bois de teck',
        date: '2022-10-01',
        amount: '150',
        vat: 20,
        pct: 10,
        commentary: 'Bureau du chef de projet',
        file: file,
      }

      // https://testing-library.com/docs/dom-testing-library/api-events/#fireeventeventname
      fireEvent.change(inputSelect, { target: { value: formValues.type } })
      fireEvent.change(inputName, { target: { value: formValues.name } })
      fireEvent.change(inputDate, { target: { value: formValues.date } })
      fireEvent.change(inputAmount, { target: { value: formValues.amount } })
      fireEvent.change(inputVAT, { target: { value: formValues.vat } })
      fireEvent.change(inputPCT, { target: { value: formValues.pct } })
      fireEvent.change(inputCom, { target: { value: formValues.commentary } })
      userEvent.upload(inputFile, formValues.file)

      // SIMULATION OF FUNCTION + LISTENER + SUBMIT
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      formulaire.addEventListener('submit', handleSubmit)
      fireEvent.submit(formulaire)

      expect(handleSubmit).toHaveBeenCalled()
      expect(inputSelect.validity.valid).not.toBeTruthy()
      expect(inputName.validity.valid).toBeTruthy()
      expect(inputDate.validity.valid).toBeTruthy()
      expect(inputVAT.validity.valid).toBeTruthy()
      expect(inputPCT.validity.valid).toBeTruthy()
      expect(inputCom.validity.valid).toBeTruthy()
      expect(inputFile.files[0]).toBeDefined()      
    })
  })

  //************* TEST A NON VALID FORM SUBMITED THEN WE SHOULD STAY ON NEW BILL PAGE
  describe('When I submit a non valid form', () => {  
    it("Then I should stay on New Bill page", async () => {
      // AS WE CALL A CLASS WITH PARAMETERS WE CALL THIS CLASS
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })

      // EMPTY INPUT TEST
      expect(screen.getByTestId('expense-type')).toBeTruthy()
      expect(screen.getByTestId('expense-name').value).toBe("")
      expect(screen.getByTestId('datepicker').value).toBe("")
      expect(screen.getByTestId('amount').value).toBe("")
      expect(screen.getByTestId('vat').value).toBe("")
      expect(screen.getByTestId('pct').value).toBe("")
      expect(screen.getByTestId('commentary').value).toBe("")
      expect(screen.getByTestId('file').value).toBe("")

      // SEND FORM TEST
      // WE CAPTURE THE FORM
      const form = document.querySelector(`form[data-testid= 'form-new-bill']`)

      // WE SIMULATE A CALL FUNCTION
      const handleFormSubmit = jest.fn((evt) => newBill.handleSubmit(evt))

      // WE CAPTURE THE EVENT
      form.addEventListener('submit', handleFormSubmit)

      // I SUBMIT THE FORM
      fireEvent.submit(form)

      expect(handleFormSubmit).toHaveBeenCalled()
      expect(form).toBeTruthy()
    })
  })

  //************* TEST ERROR 404
  describe("When an error 404 occurres on submit", () => {
    it("Then a warning should be displayed on console", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })

      // ERROR SIMULATION
      jest.spyOn(mockStore, 'bills')
      console.error = jest.fn()

      // mockImplementationOnce : Accepts a function that will be used as an implementation of the mock for one call to the mocked function. 
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 404'))
          },
        }
      })

      const formulaire = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      formulaire.addEventListener('submit', handleSubmit)
      fireEvent.submit(formulaire)

      await new Promise(process.nextTick)
      expect(console.error).toBeCalled()
    })
  })

  //************* TEST ERROR 500
  describe("When an error 500 occurres on submit", () => {
    it("Then a warning should be displayed on console", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      })

      // ERROR SIMULATION
      jest.spyOn(mockStore, 'bills')
      console.error = jest.fn()

      // mockImplementationOnce : Accepts a function that will be used as an implementation of the mock for one call to the mocked function. 
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 500'))
          },
        }
      })

      const formulaire = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      formulaire.addEventListener('submit', handleSubmit)
      fireEvent.submit(formulaire)

      await new Promise(process.nextTick)
      expect(console.error).toBeCalled()
    })
  })


})
