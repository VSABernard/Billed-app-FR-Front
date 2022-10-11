import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener('submit', this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener('change', this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  handleChangeFile = e => {
    
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    // const filePath = e.target.value.split(/\\/g)
    // const fileName = filePath[filePath.length-1]
    let fileName = ''
    if(file !== undefined){
      fileName = file.name
    }
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)
    
    //******************* VERIFICATION OF THE FILE'S EXTENSION WHICH IS UPLOADED BY THE EMPLOYEE (SHOULD BE :JPG/ JPEG/ PNG) 
    
    const errorMessage = this.document.querySelector('span.errorMessage')
    
    if(fileName === '') {
      errorMessage.classList.add('hidden')
      return
    }
    
    try {
      if (this.checkFileExtension(fileName)) {
        errorMessage.classList.add('hidden')
      }
    }
    catch(error) {
      errorMessage.classList.remove('hidden')   
      return
    }    

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        // console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }

  /************************
   * CHECK IF THE FILE'S EXTENSION IS AUTHORISED (jpg, jpeg, png)
   * @param {*} fileName 
   * @returns true if the file's extension is correct
   */
  checkFileExtension = fileName => {
    if (fileName.indexOf("jpg") != -1 || fileName.indexOf("jpeg") != -1 || fileName.indexOf("png") != -1 ) {
      return true
    }
    throw "Extension is not authorised"
  }

  handleSubmit = e => {
    e.preventDefault()
    // console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch((error) => console.error(error))
    }
  }
}