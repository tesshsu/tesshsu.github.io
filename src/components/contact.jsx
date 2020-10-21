import React, { Component } from 'react'
import PropTypes from "prop-types";
import axios from "axios";

/**
 * @component ContactForm
 * @props - { object } -  config
 */
export default class ContactForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mailSent: false,
      error: null
    };
  }
  /**
  * @function handleFormSubmit
  * @param e { obj } - ContactForm event
  * @return void
  */
  handleFormSubmit = e => {
    e.preventDefault();
    axios({
      method: "post",
      url: `${process.env.REACT_APP_API}`,
      headers: { "content-type": "application/json" },
      data: this.state
    })
      .then(result => {
        if (result.data.sent) {
          this.setState({
            mailSent: result.data.sent
          });
          this.setState({ error: false });
        } else {
          this.setState({ error: true });
        }
      })
      .catch(error => this.setState({ error: error.message }));
  };
  /**
    * @function handleChange
    * @param e { obj } - change event
    * @param field { string } - namve of the field
    * @return void
    */
  handleChange = (e, field) => {
    let value = e.target.value;
    let updateValue = {};
    updateValue[field] = value;
    this.setState(updateValue);
  };

  render() {
    const { title, successMessage, errorMessage, fieldsConfig } = this.props.config;
    return (
	<section className="colorlib-experience" data-section="contact">
	  <div className="colorlib-narrow-content">
	     <div className="row">
            <div className="col-md-6 col-md-offset-3 col-md-pull-3 animate-box" data-animate-effect="fadeInLeft">
               <span className="heading-meta">Contact</span>
               <h2 className="colorlib-heading animate-box">Demander pour un devis ?</h2>
            </div>
         </div>
	  </div>
	  <div className="row">
	    <div className="ContactForm">
		  <p>{title}</p>
        <div>
          <form action="#">
            {fieldsConfig &&
              fieldsConfig.map(field => {
                return (
                  <React.Fragment key={field.id}>
                    {field.type !== "textarea" ? (
                      <React.Fragment>
                        <label>{field.label}</label>
                        <input
                          type={field.type}
                          className={field.klassName}
                          placeholder={field.placeholder}
                          value={field.name}
                          onChange={e => this.handleChange(e, field.fieldName)}
                        />
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <label>{field.label}</label>
                        <textarea className={field.klassName} placeholder={field.placeholder} onChange={e => this.handleChange(e, field.fieldName)} value={field.name} />
                      </React.Fragment>
                    )}
                  </React.Fragment>
                );
              })}
            <input type="submit" onClick={e => this.handleFormSubmit(e)} value="Submit" />
            <div>
              {this.state.mailSent && <div className="sucsess">{successMessage}</div>}
              {this.state.error && <div className="error">{errorMessage}</div>}
            </div>
          </form>
        </div>
		</div>
	  </div>
	</section>
      
    );
  }
}

//propTypes for the component
ContactForm.propTypes = {
  config: PropTypes.object.isRequired
};