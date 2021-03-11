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
              <p>{title}</p>
              <p className="colorlib-heading animate-box"> vous pouvez <a target="_parentnpm r" href='https://vachatech.simplybook.it/v2/#book'>réservation RDV en ligne</a> ou Remplissez le formulaire : </p>
            </div>
         </div>
	  </div>
	  <div className="row">
	    <div className="ContactForm">
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
            <input type="submit" onClick={e => this.handleFormSubmit(e)} value="Envoyer" />
            <p>**vous acceptez les conditions en cliquer envoyer**</p>
            <p>Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée (art.38 et s.), vous disposez d'un droit d'accès, de modification, de rectification et de suppression des données vous concernant.
              Pour toute demande, adressez-vous à : info@vacha-desig.com</p>
            <small>Le site vacha-design.com est édité par la société eoechange (ci-après « eoechange » ou « nous »), sous le n°SIRET 84937554800013, APE 6201z Programmation informatique en leur qualité de responsables de traitement.</small>
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
