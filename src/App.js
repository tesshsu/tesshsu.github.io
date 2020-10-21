import React, { Component } from 'react';
import './App.css';
import Sidebar from './components/sidebar'
import Introduction from './components/introduction'
import About from './components/about'
import Project from './components/projects'
import Timeline from './components/timeline'
import ContactForm from './components/contact'

const config = {
  api: `http://localhost:3000/api/contact/index.php`,
  title: 'SI VOUS AVEZ BESOIN D’UN DÉVELOPPEUR EXPÉRIMENTÉ POUR VOTRE APPLICATION MOBILE, APPLICATION WEB E-COMMERCE, MARKETPLACE, UNE API OU SYSTEM ERP, CRM ETC., VOUS POUVEZ SOIT M’EMBAUCHER DIRECTEMENT EN UTILISANT LE FORMULAIRE CI-DESSOUS',
  successMessage: 'Merci de me contacter.',
  errorMessage: 'Désolé, nous avons des problèmes.',
  fields:{
    firstName: '',
    lastName: '',
    email: '',
    msg: ''
  },
  fieldsConfig:  [
   { id: 1, label: 'Prénom', fieldName: 'Prénom', type: 'text',placeholder:'Votre Prénom', isRequired: true , klassName:'first-name-field'},
   { id: 2, label: 'Nom', fieldName: 'Nom', type: 'text', placeholder: 'Votre Nom', isRequired: true , klassName:'last-name-field'},
   { id: 3, label: 'Email', fieldName: 'email', type: 'email', placeholder: ' Votre Email', isRequired: true , klassName:'email-field'},
   { id: 4, label: 'Message', fieldName: 'msg', type: 'textarea',placeholder:'Votre project.....', isRequired: true , klassName:'message-field'}
  ]
}

class App extends Component {
  render() {
    return (
      <div id="colorlib-page">
        <div id="container-wrap">
         	<Sidebar></Sidebar>
				<div id="colorlib-main">
					<Introduction></Introduction>
					<About></About>
					<Project></Project>
					<Timeline></Timeline>
					<ContactForm config={config} />
          	</div>
      	</div>
      </div>
    );
  }
}

export default App;
