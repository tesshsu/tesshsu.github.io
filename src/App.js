import React, { Component } from 'react';
import './App.css';
import Sidebar from './components/sidebar'
import Introduction from './components/introduction'
import Formation from './components/formation'
import About from './components/about'
import Project from './components/projects'
import Timeline from './components/timeline'
import ContactForm from './components/contact'

const config = {
  api: `http://localhost:3000/api/contact/index.php`,
  title: 'SI VOUS AVEZ BESOIN D’UN DÉVELOPPEUR EXPÉRIMENTÉ POUR VOTRE APPLICATION MOBILE, APPLICATION WEB E-COMMERCE, MARKETPLACE, UNE API OU SYSTEM ERP, CRM ETC., VOUS POUVEZ SOIT M’EMBAUCHER DIRECTEMENT EN UTILISANT LE FORMULAIRE CI-DESSOUS',
  successMessage: 'Merci de me contacter. On vous contacterai au sien de votre demande',
  errorMessage: 'Désolé, nous avons des problèmes, vous pourriez également me contacter direct par email.',
  fields:{
    email: '',
    msg: ''
  },
  fieldsConfig:  [
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
                    <Formation></Formation>
					<ContactForm config={config} />
          	</div>
      	</div>
      </div>
    );
  }
}

export default App;
