<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <img
          src="../../assets/G2P-logo.png"
          alt="G2P logo"
          width="30"
          height="30"
          class="d-inline-block align-text-top"
        />
        Gene2Phenotype
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mb-2 mb-lg-0 me-auto">
          <li class="nav-item dropdown">
            <span
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              About
            </span>
            <ul class="dropdown-menu">
              <li>
                <router-link to="/about/project" class="dropdown-item">
                  The Project
                </router-link>
              </li>
              <li><a class="dropdown-item" href="#">Terminology</a></li>
              <li>
                <router-link to="/variant-filtering" class="dropdown-item">
                  Variant filtering
                </router-link>
              </li>
              <li>
                <router-link to="/publications" class="dropdown-item"
                  >Publications</router-link
                >
              </li>
              <li>
                <router-link to="/curators" class="dropdown-item">
                  Curators
                </router-link>
              </li>
              <li><a class="dropdown-item" href="#">Announcements</a></li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Curate</a
            >
            <ul class="dropdown-menu">
              <li>
                <router-link to="/lgd/add" class="dropdown-item">
                  Add New G2P Record
                </router-link>
              </li>
              <li>
                <router-link to="/curation/entries" class="dropdown-item">
                  Saved Drafts
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="#">Log In</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
