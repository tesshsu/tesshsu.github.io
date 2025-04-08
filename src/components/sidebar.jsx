import React, { Component } from 'react'
import BookingWidget from "./BookingWidget";
export default class Sidebar extends Component {
  render() {
    return (
      <div>
        <div>
          <nav href="#navbar" className="js-colorlib-nav-toggle colorlib-nav-toggle" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar"><i /></nav>
          <aside id="colorlib-aside" className="border js-fullheight">
            <div className="text-center">
              <div className="author-img" style={{backgroundImage: 'url(images/vacha.png)'}} />
              <h1 id="colorlib-logo"><a href="index.html">Vacha Tech</a></h1>
              <span className="email"><i className="icon-mail"></i> <a href="mailto:name@email.com">info@vacha-design.com</a></span>
            </div>
            <nav id="colorlib-main-menu" role="navigation" className="navbar">
              <div id="navbar" className="collapse">
                <ul>
                  <li className="active"><a href="#home" data-nav-section="home">Introduction</a></li>
                  <li><a href="#about" data-nav-section="about">About</a></li>
                  <li><a href="#projects" data-nav-section="projects">Projects</a></li>
                  <li><a href="#timeline" data-nav-section="timeline">Timeline</a></li>
				          <li><a href="#contact" data-nav-section="contact">Contact</a></li>
                </ul>
              </div>
            </nav>
            <nav id="colorlib-main-menu">
              <ul>
                <li><a href="https://www.facebook.com/VachaDesign/" target="_parent" rel="noopener noreferrer"><i className="icon-facebook2" /></a></li>
                <li><a href="https://www.linkedin.com/company/43357715/" target="_parent" rel="noopener noreferrer"><i className="icon-linkedin2" /></a></li>
                <li><a href="https://github.com/tesshsu" target="_parent" rel="noopener noreferrer"><i className="icon-github"></i></a></li>
              </ul>
            </nav>
            <div className="colorlib-footer">
              <p><small>
                  Mnade with Reactjs <i className="icon-heart" aria-hidden="true" /> & php <i className="icon-beer" aria-hidden="true" />
              </small></p>
			        <ul>
                <li>
                  Pour demander un devis ou consulter votre projet ? vous pourrez réserver un rendez-vous
                </li>
                <li>
                </li>
			    <li>
			     <a target="_parent" href='https://www.malt.fr/profile/tesshsu'><img alt='malt' src='images/malt.png' /></a>
				</li>
                <li>
                  <a target="_parent" href='https://www.superprof.fr/tableau-de-bord.html/annonces/edition/6562128'><img alt='malt' src='images/superprof.png' /></a>
                </li>
	          </ul>
            </div>
          </aside>
        </div>
      </div>
    )
  }
}
