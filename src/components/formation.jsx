import React, { Component } from 'react'
import YouTube from 'react-youtube';

export default class Formation extends Component {
  render() {
	  const opts = {
		  height: '390',
		  width: '450',
		  playerVars: {
			  autoplay: 1,
		  },
	  };
    return (
      <div>
        <section className="colorlib-blog" data-section="blog">
			<div className="colorlib-narrow-content">
				<div className="row">
					<div className="col-md-6 col-md-offset-3 col-md-pull-3 animate-box" data-animate-effect="fadeInLeft">
					<span className="heading-meta">Formation</span>
					<h2 className="colorlib-heading">Donne cours de développement web et programmation (tous niveaux)</h2>
						<p>Si vous souhaitez être accompagné lors de contruire un site vitrine, blog ou e-commerce pour votre propre business ou votre 2eme activité ?</p>
					</div>
				</div>
				<div className="row">
					<div className="col-md-4 col-sm-6 animate-box" data-animate-effect="fadeInLeft">
					<div className="blog-entry">
						<img src="images/blog-1.jpg" className="img-responsive" alt="vacha formation" />
						<div className="desc">
							<span><small>CMS </small> | <small> Web Design </small> | <small> <i className="icon-bubble3" /> Base tous niveaux</small></span>
							<h3>Wordpress, Prestashop, Joomla CMS 25€/h</h3>
							<p>Tout comme chaque personne est différente, selon vos besoins et objectifs :</p>
							<ul>
								<li>Conception du web : hébergement, nom de domaine, certificat de sécurité</li>
								<li>Installer Wordpress au CMS, un thème et des extensions</li>
								<li>Web Design</li>
								<li>Comprendre la structure de WordPress, son administration</li>
								<li>Comprendre la structure de CMS</li>
								<li>Sécurité, sauvegardes des données sur hébergement</li>
								<li>Personnaliser votre thème Wordpress pour l'adapter à vos besoins</li>
							</ul>
						</div>
					</div>
					</div>
					<div className="col-md-4 col-sm-6 animate-box" data-animate-effect="fadeInRight">
					<div className="blog-entry">
						<img src="images/blog-2.jpg" className="img-responsive" alt="formation app vacha" />
						<div className="desc">
							<span><small>APP </small> | <small> Application mobile </small> | <small> <i className="icon-bubble3" /> niveaux informatique</small></span>
							<h3>React-native 35€/h</h3>
							<p> vous guide a la meilleure pratique a utilisé. :</p>
							<ul>
								<li>Conception du APP : Application mobile développée pour Android et iOS</li>
								<li>Base sur Typescript</li>
								<li>Base sur React Native</li>
								<li>Structure composant</li>
								<li>Comprendre Basic Apple store et google develope</li>
								<li>Comprendre app builder platform</li>
							</ul>
						</div>
					</div>
					</div>
					<div className="col-md-4 col-sm-6 animate-box" data-animate-effect="fadeInLeft">
					<div className="blog-entry">
						<img src="images/blog-3.jpg" className="img-responsive" alt="formation app vacha" />
						<div className="desc">
							<span><small>Site web </small> | <small> par scratch </small> | <small> <i className="icon-bubble3" /> niveaux informatique</small></span>
							<h3>PHP MySQL Full stack 45€/h</h3>
							<p> Développement web PHP & MySQL avec react :</p>
							<ul>
								<li>Créer des pages PHP</li>
								<li>Base sur MVC</li>
								<li>Créer et utiliser des variables</li>
								<li>Faire des requêtes vers une base de données MySQL et les fondamentaux du langage SQL</li>
								<li>Intégrer des données de votre base de données sur vos pages PHP</li>
								<li>Base react Typescrpt API redux</li>
							</ul>
						</div>
					</div>
					</div>
				</div>
			</div>
			<div className="row text-center">
				<div className="col-md-6 col-sm-12 animate-box" data-animate-effect="fadeInLeft">
					<h3>Accompagnement, Refonte</h3>
					<p> Formation à la configuration de votre projet informatique</p>
					<ul>
						<li>L'univers du web</li>
						<li>Comprendre la structure base</li>
						<li>L'adapter à vos besoins</li>
						<li>Cerner les difficultés propres à chaque élève pour obtenir une progression régulière</li>
					</ul>
				</div>
				<div className="col-md-6 col-sm-12 animate-box" data-animate-effect="fadeInLeft">
					<YouTube videoId="tvdnut0V7Dk" opts={opts} className="video" onReady={this._onReady} />
				</div>
			</div>
			</section>
      </div>
    )
  }
}
