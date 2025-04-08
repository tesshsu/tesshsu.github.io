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
                <div className="about-desc text-left">
                    <span className="heading-meta">À propos de moi</span>
                    <h2 className="colorlib-heading">Mon parcours professionnel</h2>
                    <h4>
                    Ingénieure Logiciel – Expertise Backend, DevOps & Cybersécurité
                    </h4>
                    <p>
                    Mon parcours est atypique et enrichissant. Après des études en construction puis en design, j'ai débuté ma carrière dans le graphisme à Boston (USA). C'est au cours de ces cinq années que j'ai commencé à toucher à la programmation. J'ai ensuite intégré Academia Sinica (Centre national de recherche à Taïwan) en tant que développeuse PHP, ce qui a marqué le début de mon parcours en développement.
                    </p>
                    <p>
                    J’ai évolué en tant que développeuse front-end, puis lead web développeuse chez Digital River. En 2017, je me suis installée en France où j’ai consolidé mon profil Full Stack. Cette trajectoire m’a permis de comprendre l’écosystème informatique depuis ses fondations, en développant une vision globale et orientée solution.
                    </p>
                    <p>
                    En entreprise, j’ai progressivement pris en charge les aspects DevOps, notamment avec AWS, Google Kubernetes Engine (GKE), et l’intégration de normes HDS pour la sécurisation des données de santé. Cette approche m’a naturellement conduite à me concentrer sur l’architecture des systèmes cœur d’entreprise et à intégrer la cybersécurité comme priorité stratégique.
                    </p>
                    <p>
                    Aujourd’hui, je poursuis ma montée en compétences dans ce domaine avec une certification en cybersécurité pré-ISC2, ainsi qu’une formation reconnue par l’État français en « Sécurité Pentesting » (RS6092). Dans un monde de plus en plus dominé par l’intelligence artificielle, je suis convaincue que la sécurité du système d'information est plus que jamais au cœur de la pérennité des entreprises.
                    </p>
                    <ul>
                    <li><strong>Budhapp:</strong> Infrastructure cloud (GKE, AWS), CI/CD GitLab, automatisation via Terraform, Helm, Ansible.</li>
                    <li><strong>Livmed's:</strong> Migration TypeScript, conception d'APIs modulaires orientées objet, microservices B2B, optimisation SEO.</li>
                    <li><strong>Groupe Itekcom:</strong> Développement de solutions serveurs, automatisation des processus internes, modules d'import/export de produits.</li>
                    </ul>
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
                <h3>DevOps & Cybersecurity</h3>
                <p>
                    Mise en œuvre d'environnements cloud scalables avec des outils tels que <strong>Terraform</strong>, <strong>Helm</strong>, <strong>Ansible</strong> et <strong>GitLab CI/CD</strong> pour automatiser les déploiements sur <strong>Kubernetes</strong> (GKE, EKS). 
                </p>
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
      </div>
    )
  }
}
