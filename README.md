# Gene2Phenotype (G2P) Website

The Gene2Phenotype (G2P) Website provides a web interface to access evidence-based gene-disease models, curated from the literature by experts.
It is part of the Gene2Phenotype project, established by David FitzPatrick in 2012 with the aim of accelerating the diagnosis of children with developmental disorders. In 2014, the database moved from the University of Edinburgh to EMBL-EBI and a dedicated website was launched to improve data accessibility. G2P has been generalised to cover other disease areas and extended to capture additional information to provide a more detailed understanding of disease mechanism. To read more about the project, please visit the [G2P website](https://www.ebi.ac.uk/gene2phenotype/about/project).

API documentation is available at [Gene2Phenotype API Documentation](https://www.ebi.ac.uk/gene2phenotype/api/).

### Prerequisites

The G2P website requires:

1. Node.js
2. npm

### Installation

Run the following commands to install the required Node packages for the G2P website to run.

```bash
> git clone https://github.com/EBI-G2P/gene2phenotype_web.git
> cd gene2phenotype_web
> npm install
```

### Usage

1. Set up the [G2P API](https://github.com/EBI-G2P/gene2phenotype_api) on your local machine.
2. Run the following commands to start the G2P website.

```bash
> cd gene2phenotype_web
> npm run dev
```

3. Open [http://localhost:5173/gene2phenotype](http://localhost:5173/gene2phenotype) in your browser - the website should be running!
