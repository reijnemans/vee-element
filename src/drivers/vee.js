import { get, isEmpty, noop } from '../utils'

export default class VeeDriver {

  constructor (validator) {
    this.validator = validator
  }

  validate (trigger, callback = noop, driver = null) {

    // this.validateDisabled = false
    if (trigger === 'blur' && !isEmpty(this.fieldValue)) {
      return
    }

    const rules = this.getRules()
    if (!rules) {
      callback()
    }

    // this.validateState = 'validating'
    const validator = driver.validator
    validator
      .verify(this.fieldValue, rules)
      .then(({ valid, errors }) => {
        // variables
        const prop = this.prop
        const error = errors[0]

        // generate error messages
        const THE_FIELD = 'The {field} field';
        const THIS_FIELD = 'This field';
        const theField = validator.dictionary.getAttribute(validator.dictionary.locale, THE_FIELD) || THE_FIELD;
        const thisField = validator.dictionary.getAttribute(validator.dictionary.locale, THIS_FIELD) || THIS_FIELD;
        const errorField = error
          ? error.replace(theField, thisField)
          : ''
        const errorForm = error
          ? error.replace('{field}', `"${prop}"`)
          : null
        const invalidFields = {}
        if (!valid) {
          invalidFields[prop] = [{
            field: prop,
            label: this.label,
            message: errorForm
          }]
        }

        // update
        this.validateState = valid ? 'success' : 'error'
        this.validateMessage = errorField

        // respond
        callback(errorForm, invalidFields)
        this.elForm && this.elForm.$emit('validate', prop, !errors, errorForm)
      })
  }

  getRules () {
    return this.rules
      ? this.rules
      : this.prop
        ? get(this.form.rules, this.prop) || ''
        : ''
  }

  getFilteredRule () {
    return this.getRules()
  }

  isRequired () {
    const rules = this.getRules()
    return typeof rules === 'string'
      ? /\brequired\b/.test(rules)
      : !!get(rules, 'required')
  }

}
