<script>
import ToolTip from "../components/tooltip/ToolTip.vue";

const NAVIGATION_ITEMS = Object.freeze([
  { id: "navigation-section", label: "Navigation" },
  { id: "search-section", label: "Search" },
  { id: "finding-help-section", label: "Finding help information" },
  { id: "logging-in-section", label: "Logging in" },
  { id: "links-section", label: "Links" },
  { id: "further-help-section", label: "Further help" },
]);

export default {
  data() {
    return {
      observer: null,
      navigationItems: NAVIGATION_ITEMS,
    };
  },
  mounted() {
    this.observer = new IntersectionObserver(this.onElementObserved, {
      root: null,
      rootMargin: "-50% 0% -50% 0%",
      threshold: 0,
    });

    this.$refs.content.querySelectorAll("section[id]").forEach((section) => {
      this.observer.observe(section);
    });
  },
  beforeUnmount() {
    this.observer?.disconnect();
  },
  components: {
    ToolTip,
  },
  methods: {
    onElementObserved(entries) {
      entries.forEach(({ target, isIntersecting }) => {
        const id = target.getAttribute("id");
        this.$el
          .querySelectorAll(`nav a[href="#${id}"]`)
          .forEach((link) => link.classList.toggle("active", isIntersecting));
      });
    },
  },
};
</script>
<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <main id="website-help-main">
      <div id="website-help-content-div" ref="content">
        <div class="dropdown mobile-navigation mb-4">
          <button
            id="help-mobile-navigation-button"
            class="btn btn-outline-primary dropdown-toggle w-100"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            On this page
          </button>
          <nav class="dropdown-menu w-100" aria-label="On this page">
            <a
              v-for="item in navigationItems"
              :key="item.id"
              class="dropdown-item"
              :href="`#${item.id}`"
            >
              {{ item.label }}
            </a>
          </nav>
        </div>
        <h2 class="pb-3">Using this site</h2>
        <p>
          The G2P database holds detailed gene disease models, defined as
          locus-genotype-mechanism-disease-evidence threads. These are grouped
          into overlapping panels, defined by clinical speciality. Summary
          information can also be viewed by disease or gene.
        </p>
        <p>
          From the G2P home page, you can use the search function to look for
          specific information in the G2P database or you can use the links in
          the
          <b>Browse panels</b> to navigate to information on the panel or
          download the current dataset.
        </p>
        <section id="navigation-section">
          <h4>Navigation</h4>
          <div class="mt-3 d-flex justify-content-center">
            <figure class="figure">
              <img
                src="../assets/G2P-navigation.png"
                class="figure-img img-fluid img-thumbnail border-secondary-subtle"
                alt="G2P navigation"
                width="800"
              />
            </figure>
          </div>
        </section>
        <section id="search-section">
          <h4>Search</h4>
          <p>
            G2P can be searched for gene symbols (current and previous), G2P
            disease names (current and previous), OMIM or Mondo identifiers
            (where cross references have been approved by a curator), HPO
            phenotype terms or accessions and G2P record identifiers. Queries
            can be run across the full dataset or filtered to return only
            certain data types or results from specific panels.
          </p>
          <div class="d-flex justify-content-center">
            <figure class="figure">
              <img
                src="../assets/G2P-help-search.png"
                class="figure-img img-fluid img-thumbnail border-secondary-subtle"
                alt="G2P search"
                width="800"
              />
            </figure>
          </div>
          <h5>Examples</h5>
          <h6>1. Searching for a gene returns all records for that gene</h6>
          <div class="mt-3 d-flex justify-content-center">
            <figure class="figure">
              <img
                src="../assets/G2P-help-search-example-1.png"
                class="figure-img img-fluid img-thumbnail border-secondary-subtle"
                alt="G2P search example 1"
                width="800"
              />
            </figure>
          </div>
          <h6>
            2. Searching for 'cardiomyopathy' and filtering on diseases returns
            all records with 'cardiomyopathy' in the disease name or synonym
          </h6>
          <div class="mt-3 d-flex justify-content-center">
            <figure class="figure help-figure-wide">
              <img
                src="../assets/G2P-help-search-example-2.png"
                class="figure-img img-fluid img-thumbnail border-secondary-subtle"
                alt="G2P search example 2"
                width="800"
              />
              <figcaption class="figure-caption">
                Search results page showing summary information with links to
                the G2P record page, gene page, disease page and panel pages
              </figcaption>
            </figure>
          </div>
          <h6>
            3. Searching for 'cardiomyopathy' without filtering, returns records
            where 'cardiomyopathy' is a listed phenotype in addition to all
            records with 'cardiomyopathy' in the disease name or synonym
          </h6>
          <div class="mt-3 d-flex justify-content-center">
            <figure class="figure">
              <img
                src="../assets/G2P-help-search-example-3.png"
                class="figure-img img-fluid img-thumbnail border-secondary-subtle"
                alt="G2P search example 3"
                width="800"
              />
            </figure>
          </div>
        </section>
        <section id="finding-help-section">
          <h4>Finding help information</h4>
          <p>
            Across the website, mousing over the information icons (<ToolTip
              toolTipText="Help text"
            />) opens popup summary help information.
          </p>
          <p>
            Detailed information about the data in G2P is available in
            documentation pages linked from the <b>About</b> menu on the top bar
            and the page footer.
          </p>
          <p>Relevant publications are listed for more detailed information.</p>
        </section>
        <section id="logging-in-section">
          <h4>Logging in</h4>
          <p>
            The functionality available to logged in users enables registered
            clinical/scientific curators to curate G2P records within the panels
            for which they are responsible. All reviewed and approved G2P
            records are openly available on the website, with no login needed.
          </p>
        </section>
        <section id="links-section">
          <h4>Links</h4>
          <p>
            Links within G2P pages enable easy navigation between pages
            describing particular entities (G2P association records, genes or
            diseases). Links to external sites are also present for further
            information on genes, definitions of ontology terms etc.
          </p>
        </section>
        <section id="further-help-section">
          <h4>Further help</h4>
          <p>
            If you experience problems with the G2P website or need further
            assistance
            <router-link to="/contact" class="text-decoration-none"
              >contact us</router-link
            >.
          </p>
        </section>
      </div>
      <nav
        id="side-navbar"
        class="h-100 flex-column align-items-stretch ps-3"
        aria-label="On this page"
      >
        <strong class="d-none d-md-block h6 my-2 ms-3 text-body-secondary">
          On this page
        </strong>
        <hr class="d-none d-md-block my-2 ms-3" />
        <div class="nav nav-pills flex-column">
          <a
            v-for="item in navigationItems"
            :key="item.id"
            class="nav-link"
            :href="`#${item.id}`"
          >
            {{ item.label }}
          </a>
        </div>
      </nav>
    </main>
  </div>
</template>
<style scoped>
/* Sticky Navigation */
main > nav {
  position: sticky;
  top: 2rem;
  align-self: start;
}

#website-help-main {
  display: flex;
  justify-content: space-between;
}

#website-help-content-div {
  width: 80%;
}

#side-navbar {
  width: 20%;
}

.help-figure-wide {
  width: 100%;
  max-width: 800px;
}

.mobile-navigation {
  display: none;
}

@media (max-width: 767.98px) {
  #website-help-content-div {
    width: 100%;
    min-width: 0;
  }

  #side-navbar {
    display: none;
  }

  .mobile-navigation {
    display: block;
  }
}
</style>
