import React, { Component } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import BookingWidget from "./BookingWidget";

export default class ContactForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mailSent: false,
      error: null,
    };
  }

  handleFormSubmit = (e) => {
    e.preventDefault();
    axios({
      method: "post",
      url: `${process.env.REACT_APP_API}`,  // Keep your original API endpoint
      headers: { "content-type": "application/json" },
      data: {
        ...this.state,                     // Spread existing state data
        to: "tess.hsu@gmail.com"          // Add the recipient email
      },
    })
      .then((result) => {
        if (result.data.sent) {
          this.setState({ mailSent: result.data.sent, error: false });
        } else {
          this.setState({ error: true });
        }
      })
      .catch((error) => this.setState({ error: error.message }));
  };

  handleChange = (e, field) => {
    this.setState({ [field]: e.target.value });
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
              <BookingWidget />

            </div>
          </div>
        </div>

        <div className="row">
          <div className="ContactForm">
            <form action="mailto:tess.hsu@gmail.com" method="get" encType="text/plain">
              {fieldsConfig &&
                fieldsConfig.map((field) => (
                  <React.Fragment key={field.id}>
                    <label>{field.label}</label>
                    {field.type !== "textarea" ? (
                      <input
                        type={field.type}
                        className={field.klassName}
                        placeholder={field.placeholder}
                        value={this.state[field.fieldName] || ""}
                        onChange={(e) => this.handleChange(e, field.fieldName)}
                        name={field.fieldName} // Add name attribute to map to email fields
                      />
                    ) : (
                      <textarea
                        className={field.klassName}
                        placeholder={field.placeholder}
                        onChange={(e) => this.handleChange(e, field.fieldName)}
                        value={this.state[field.fieldName] || ""}
                        name={field.fieldName} // Add name attribute to map to email fields
                      />
                    )}
                  </React.Fragment>
                ))}
              <input type="submit" value="Envoyer" />
              <p>**vous acceptez les conditions en cliquant sur envoyer**</p>
              <p>
                Conformément à la loi « Informatique et Libertés » du 6 janvier 1978 modifiée (art.38 et s.), vous disposez d'un droit d'accès, de modification, de rectification et de suppression des données vous concernant.
                Pour toute demande, adressez-vous à : info@vacha-desig.com
              </p>
              <small>Le site vacha-design.com est édité par la société eoechange...</small>

              <div>
                {this.state.mailSent && <div className="sucsess">{successMessage}</div>}
                {this.state.error && <div className="error">{errorMessage}</div>}
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }
}

ContactForm.propTypes = {
  config: PropTypes.object.isRequired,
};