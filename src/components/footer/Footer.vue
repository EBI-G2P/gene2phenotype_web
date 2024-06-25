<template>
  <footer class="footer mt-auto py-3 bg-body-tertiary">
    <div class="container">
      <div class="row">
        <div class="col-6">
          <div class="row">
            <div class="col mb-3">
              <h5>Information</h5>
              <ul class="nav flex-column">
                <li class="nav-item mb-2">
                  <a href="#" class="nav-link p-0 text-body-secondary">
                    Documentation
                  </a>
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
                  <a href="#" class="nav-link p-0 text-body-secondary">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div class="col mb-3">
              <h5>Data</h5>
              <ul class="nav flex-column">
                <li class="nav-item mb-2">
                  <a href="#" class="nav-link p-0 text-body-secondary">
                    Downloads
                  </a>
                </li>
              </ul>
            </div>
            <div class="col mb-3">
              <h5>Policies</h5>
              <ul class="nav flex-column">
                <li class="nav-item mb-2">
                  <a
                    href="https://www.ebi.ac.uk/data-protection/privacy-notice/gene2phenotype-helpdesk"
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
          </div>
        </div>
        <div class="col-6">
          <div class="row">
            <div class="col-1 mb-3"></div>
            <div class="col-4 mb-3">
              <p>Funded by Wellcome.</p>
              <div class="d-flex flex-column flex-sm-row w-100 gap-2">
                <a href="https://wellcome.org/" target="_blank">
                  <img
                    alt="WELLCOME logo"
                    src="../../assets/WELLCOME-logo.png"
                    width="50%"
                    height="auto"
                  />
                </a>
              </div>
            </div>
            <div class="col-7 mb-3">
              <p>G2P is part of the PARADIGM initiative.</p>
              <div class="d-flex flex-column flex-sm-row w-100 gap-2">
                <a href="https://paradigmgenomics.org/" target="_blank">
                  <img
                    alt="PARADIGM logo"
                    src="../../assets/PARADIGM-logo.png"
                    width="100%"
                    height="auto"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="d-flex flex-column flex-sm-row pt-3 pb-2 mt-3 mb-2 border-top"
      >
        <p style="margin-right: 12px">&copy; EMBL-EBI 2024</p>
        <a href="https://www.ebi.ac.uk/" target="_blank">
          <img
            alt="EMBL-EBI logo"
            src="../../assets/EMBL-EBI-logo.png"
            width="25%"
            height="auto"
          />
        </a>
      </div>
    </div>
  </footer>
</template>
