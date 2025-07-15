<template>
  <footer class="footer mt-auto py-3 footer-bg-color">
    <div class="container">
      <div class="row">
        <div class="col-md-4 col-lg col-xl-2 mb-3">
          <h5>Information</h5>
          <ul class="nav flex-column">
            <li class="nav-item mb-2">
              <router-link
                to="/about/project"
                class="nav-link p-0 text-body-secondary"
              >
                The G2P project
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link
                to="/about/terminology"
                class="nav-link p-0 text-body-secondary"
              >
                Terminology
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link
                to="/variant-filtering"
                class="nav-link p-0 text-body-secondary"
              >
                Variant filtering
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link
                to="/reference-data"
                class="nav-link p-0 text-body-secondary"
              >
                Reference data
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link
                to="/publications"
                class="nav-link p-0 text-body-secondary"
              >
                Citing G2P
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link
                to="/g2p-website-help"
                class="nav-link p-0 text-body-secondary"
              >
                G2P website help
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link
                to="/contact"
                class="nav-link p-0 text-body-secondary"
              >
                Contact us
              </router-link>
            </li>
          </ul>
        </div>

        <div class="col-md-4 col-lg col-xl-2 mb-3">
          <h5>Policies</h5>
          <ul class="nav flex-column">
            <li class="nav-item mb-2">
              <a
                href="https://ftp.ebi.ac.uk/pub/databases/gene2phenotype/privacy_notices/"
                target="_blank"
                class="nav-link p-0 text-body-secondary"
              >
                Privacy
              </a>
            </li>
            <li class="nav-item mb-2">
              <a
                href="https://www.ebi.ac.uk/about/terms-of-use#privacy"
                target="_blank"
                class="nav-link p-0 text-body-secondary"
              >
                Cookies
              </a>
            </li>
            <li class="nav-item mb-2">
              <router-link
                to="/disclaimer"
                class="nav-link p-0 text-body-secondary"
              >
                Disclaimer
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <a
                href="https://www.ebi.ac.uk/about/terms-of-use#general"
                target="_blank"
                class="nav-link p-0 text-body-secondary"
              >
                Terms of use
              </a>
            </li>
          </ul>
        </div>
        <div class="col-md-4 col-lg col-xl-1 mb-3">
          <h5>Data</h5>
          <ul class="nav flex-column">
            <li class="nav-item mb-2">
              <router-link
                to="/download"
                class="nav-link p-0 text-body-secondary"
              >
                Downloads
              </router-link>
            </li>
            <li class="nav-item mb-2">
              <router-link
                to="/g2p-api-info"
                class="nav-link p-0 text-body-secondary"
              >
                G2P API
              </router-link>
            </li>
          </ul>
        </div>
        <div class="col-md-4 col-lg col-xl-2 mb-3 text-center">
          <a href="https://www.ebi.ac.uk/" target="_blank">
            <img
              alt="EMBL-EBI logo"
              src="../../assets/EMBL-EBI-logo.png"
              width="150px"
              height="auto"
            />
          </a>
        </div>
        <div class="col-md-4 col-lg col-xl-2 mb-3 text-center">
          <p>Funded by Wellcome.</p>
          <a href="https://wellcome.org/" target="_blank">
            <img
              alt="WELLCOME logo"
              src="../../assets/WELLCOME-logo.png"
              width="75px"
              height="auto"
            />
          </a>
        </div>
        <div class="col-md-4 col-lg col-xl-3 mb-3 text-center">
          <p>G2P is part of the PARADIGM initiative.</p>
          <a href="https://paradigmgenomics.org/" target="_blank">
            <img
              alt="PARADIGM logo"
              src="../../assets/PARADIGM-logo.png"
              width="240px"
              height="auto"
            />
          </a>
        </div>
      </div>
      <div
        class="d-flex flex-column flex-sm-row pt-3 pb-2 mt-3 mb-2 border-top"
      >
        <p style="margin-right: 12px">&copy; EMBL-EBI 2025</p>
      </div>
    </div>
  </footer>
</template>
<style scoped>
.footer-bg-color {
  background-color: #f1f1f2;
}
</style>
