import React, { Component } from 'react'

export default class About extends Component {
  render() {
    return (
      <div>
        <section className="colorlib-about" data-section="about">
        <div className="colorlib-narrow-content">
            <div className="row">
            <div className="col-md-12">
                <div className="row row-bottom-padded-sm animate-box" data-animate-effect="fadeInLeft">
                <div className="col-md-12">
                    <div className="about-desc">
                    <span className="heading-meta">À propos de nous</span>
                    <h2 className="colorlib-heading">Mon parcours professionnel</h2>
                    <p>Je suis Développeur FullStack et Intégrateur Web Senior a Taiwan, USA et en France avec une expérience de 8 ans.

8 ans de travail expereicne m'a appris comment impliquer la partie par le côté client, et passer d'une qualité d'aspect plus profonde que client, ce qui pourrait fournir de très bons retours de la part du client.

Des applications métier pour des grands comptes : HTC vive, bethesda game (par societe Digital River)
</p>
                    <p>Récemment sur React, react-native APP </p>
                        <p> <a target="_parent" href='https://www.superprof.fr/tableau-de-bord.html/annonces/edition/6562128'> Aussi donne cours de développement web et programmation (tous niveaux)</a>  </p>
                        <p> <a target="_parent" href='https://ecoechange.com/'> La fondatrice de la société écologique ecoechange </a>  </p>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </section>
        <section className="colorlib-about">
        <div className="colorlib-narrow-content">
            <div className="row">
            <div className="col-md-6 col-md-offset-3 col-md-pull-3 animate-box" data-animate-effect="fadeInLeft">
                <span className="heading-meta">Ce que nous faisons </span>
                <h2 className="colorlib-heading">Voici une partie de mon expertise</h2>
            </div>
            </div>
            <div className="row row-pt-md">
            <div className="col-md-4 text-center animate-box">
                <div className="services color-1">
                <span className="icon">
                    <i className="icon-bulb" />
                </span>
                <div className="desc">
                    <h3>Développement web </h3>
                    <p>création de sites Web, de commerce Marketplace et des extensions de chrome</p>
                </div>
                </div>
            </div>
            <div className="col-md-4 text-center animate-box">
                <div className="services color-3">
                <span className="icon">
                    <i className="icon-phone3" />
                </span>
                <div className="desc">
                    <h3>Application App IOS ANDROID </h3>
                    <p>Utilisez des applications IOS et Android natives, ou utilisez React natif pour vos applications APP</p>
                </div>
                </div>
            </div>
            <div className="col-md-4 text-center animate-box">
                <div className="services color-5">
                <span className="icon">
                    <i className="icon-data" />
                </span>
                <div className="desc">
                    <h3>Logiciel ERP, CRM</h3>
                    <p>À utiliser avec un logiciel ERP tel que SAP, connectez-vous aux services API Web et à d'autres outils tiers</p>
                </div>
                </div>
            </div>

            <div className="col-md-4 text-center animate-box">
                <div className="services color-2">
                <span className="icon">
                    <i className="icon-data" />
                </span>
                <div className="desc">
                    <h3>Dev Ops</h3>
                    <p>Utilisez Jenkins, Docker, Nodejs pour un déploiement automatisé</p>
                </div>
                </div>
            </div>
            <div className="col-md-4 text-center animate-box">
                <div className="services color-4">
                <span className="icon">
                    <i className="icon-layers2" />
                </span>
                <div className="desc">
                    <h3>Solution serveur</h3>
                    <p>Fournissez des solutions pour votre serveur via AWS Cloud, VPS ou un serveur dédié</p>
                </div>
                </div>
            </div>
            <div className="col-md-4 text-center animate-box">
                <div className="services color-6">
                <span className="icon">
                    <i className="icon-phone3" />
                </span>
                <div className="desc">
                    <h3>Le marketing numérique</h3>
                    <p>SEO, GA Adword, intégration Trustpilot pour toutes sortes de stratèges marketing APIs</p>
                </div>
                </div>
            </div>

            </div>
        </div>
        </section>
          <section className="colorlib-about">
              <div className="colorlib-narrow-content">
                  <div className="row">
                      <div className="col-md-6 col-md-offset-3 col-md-pull-3 animate-box" data-animate-effect="fadeInLeft">
                          <span className="heading-meta">Envie d'etre freelance ?</span>
                          <h2 className="colorlib-heading">Vous pouvez créer votre entreprise avec cela</h2>
                      </div>
                  </div>
              </div>
              <div className="col-md-6 text-center animate-box">
                  <div className="services color-6">
                <span className="icon">
                    <i className="icon-banknote" />
                </span>
                      <div className="desc">
                          <h3>Banque Shine</h3>
                          <p>Click <a href="https://www.shine.fr/referral/YATIN1564" target="_parent"> ici </a>pour 2 mois de Shine gratuits</p>
                      </div>
                  </div>
              </div>
              <div className="col-md-6 text-center animate-box">
                  <div className="services color-4">
                <span className="icon">
                    <i className="icon-layers2" />
                </span>
                      <div className="desc">
                          <h3>Doug compta</h3>
                          <p>Click <a href="https://www.dougs.fr?r=tBMtKBnTvE" target="_parent"> ici </a>pour 2 mois offerts</p>
                      </div>
                  </div>
              </div>
          </section>
      </div>
    )
  }
}
