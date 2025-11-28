<template>
  <div class="container px-5 py-3" style="min-height: 60vh">
    <h2 class="pb-2">
      Variant filtering using the G2P Ensembl Variant Effect Predictor plugin
    </h2>
    <p>
      The Ensembl Variant Effect Predictor (<a
        href="https://www.ensembl.org/info/docs/tools/vep/index.html"
        target="_blank"
        style="text-decoration: none"
        >Ensembl VEP</a
      >) predicts the molecular consequence of a variant and reports relevant
      pathogenicity predictions and information from reference databases. The
      Ensembl VEP G2P plugin (VEP-G2P) filters variant genotypes from
      exome/genome wide sequencing using knowledge encoded in the G2P database
      to identify likely disease-causing genes.
    </p>
    <h6 class="pb-2">How the Ensembl VEP G2P plugin works:</h6>
    <p>
      VEP-G2P applies a set of customisable filters to identify potential causal
      variants. Any gene with a sufficient number of potential causal variants
      in any transcript will be flagged as likely disease causing. The number of
      sufficient causal variants is derived from the G2P-curated allelic
      requirement of the gene.
    </p>
    <p>
      By default VEP-G2P checks for known genomic variants that are colocated
      with the input variants and switches on the following Ensembl VEP options:
      <a
        href="https://www.ensembl.org/info/docs/tools/vep/script/vep_options.html#opt_individual"
        target="_blank"
        style="text-decoration: none"
        >individual information</a
      >,
      <a
        href="https://www.ensembl.org/info/docs/tools/vep/script/vep_options.html#opt_symbol"
        target="_blank"
        style="text-decoration: none"
        >gene symbol</a
      >,
      <a
        href="https://www.ensembl.org/info/docs/tools/vep/script/vep_options.html#opt_af"
        target="_blank"
        style="text-decoration: none"
        >global allele frequency from 1000 Genomes Phase 3</a
      >,
      <a
        href="https://www.ensembl.org/info/docs/tools/vep/script/vep_options.html#opt_sift"
        target="_blank"
        style="text-decoration: none"
        >SIFT predictions</a
      >,
      <a
        href="https://www.ensembl.org/info/docs/tools/vep/script/vep_options.html#opt_polyphen"
        target="_blank"
        style="text-decoration: none"
        >PolyPhen-2 predictions</a
      >.
    </p>
    <h6 class="pb-2">Filtering rules:</h6>
    <p>
      A variant is considered potentially causal if it passes these filters:
    </p>
    <ul>
      <li>It overlaps a G2P gene</li>
      <li>
        The predicted molecular consequence is considered severe. The default
        list of severe consequences contains the following terms:
        splice_donor_variant, splice_acceptor_variant, stop_gained,
        frameshift_variant, stop_lost, initiator_codon_variant,
        inframe_insertion, inframe_deletion, missense_variant,
        coding_sequence_variant, start_lost, transcript_ablation,
        transcript_amplification, protein_altering_variant
      </li>
      <li>
        The allele is not observed above a set threshold in any reference
        populations. The default frequency cutoffs for an allele in a biallelic
        gene is 0.005 and for an allele in a monoallelic gene is 0.0001. The
        default allele frequency data in the Ensembl VEP cache is the 1000
        Genomes Project continental populations and gnomAD exome/genome
        population sets. Other allele frequencies datasets can be included by
        configuring VEP-G2P to use the relevant VCF files.
      </li>
    </ul>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Allelic requirement</th>
          <th>Transcript variant count filter</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            biallelic_autosomal <br />
            biallelic_PAR
          </td>
          <td>
            At least 2 heterozygous variants or 1 homozygous variants which pass
            all variant filtering rules
          </td>
        </tr>
        <tr>
          <td>
            monoallelic_autosomal <br />monoallelic_PAR <br />monoallelic_X_hem
            <br />
            monoallelic_X_het <br />monoallelic_Y_hem <br />mitochondrial
          </td>
          <td>
            At least 1 heterozygous variant or 1 homozygous variant which passes
            all filtering rules
          </td>
        </tr>
      </tbody>
    </table>
    <h6 class="pb-2">Installing and running VEP-G2P</h6>
    <p>
      Please refer to the Ensembl VEP
      <a
        href="http://www.ensembl.org/info/docs/tools/vep/script/vep_options.html"
        target="_blank"
        style="text-decoration: none"
        >documentation</a
      >
      for information on how to install and run Ensembl VEP locally. Using the
      <a
        href="http://www.ensembl.org/info/docs/tools/vep/script/vep_download.html#docker"
        target="_blank"
        style="text-decoration: none"
        >Docker</a
      >
      image is the simplest approach. Plugins including
      <a
        href="https://github.com/Ensembl/VEP_plugins/blob/main/G2P.pm"
        target="_blank"
        style="text-decoration: none"
        >VEP-G2P</a
      >
      are present in the Docker image or installed in the interactive
      installation process. The G2P datafile for your panel of choice can be
      downloaded here or PanelApp downloads can also be used.
    </p>
    <div class="citation-div">
      <p>
        vep -i input.vcf —cache --fasta
        /path/to/Homo_sapiens.GRCh38.dna.toplevel.fa.gz --plugin
        G2P,file=G2P.csv
      </p>
    </div>
    <p>
      This runs the analysis locally annotating variant genotypes in input.vcf
      using information from the Ensembl VEP cache and the G2P.csv gene data
      file, which is passed to the plugin using the mandatory
      <code>file=parameter</code>.
    </p>
    <p>
      VEP-G2P can be configured further to override the default behaviour. The
      additional options are passed to the plugin as
      <code>key=value</code> pairs.
    </p>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Key</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>af_monoallelic</th>
          <td>
            Maximum allele frequency for inclusion for monoallelic genes.<br />
            <b>Default</b>: 0.0001
          </td>
        </tr>
        <tr>
          <th>af_biallelic</th>
          <td>
            Maximum allele frequency for inclusion for biallelic genes.<br />
            <b>Default</b>: 0.005
          </td>
        </tr>
        <tr>
          <th>confidence_levels</th>
          <td>
            Confidence levels of assertions to include. Separate multiple values
            with '&'.<br />
            <b>Default</b>: definitive, strong, moderate
          </td>
        </tr>
        <tr>
          <th>all_confidence_levels</th>
          <td>
            Set value to 1 to include all assertions regardless of confidence
            level. Not recommended for diagnostic reporting.<br />
            <b>Default</b>: 0
          </td>
        </tr>
        <tr>
          <th>af_from_vcf</th>
          <td>
            Set value to 1 to include allele frequencies from VCF files. The
            location of the VCF file is configured in
            ensembl-variation/modules/Bio/EnsEMBL/Variation/DBSQL/vcf_config.json
            or ensembl-vep/Bio/EnsEMBL/Variation/DBSQL/vcf_config.json depending
            on how the ensembl-variation API was installed Filtering using
            additional VCF files takes more time than using data in the Ensembl
            VEP cache only.<br />
            <b>Default</b>: not used
          </td>
        </tr>
        <tr>
          <th>af_from_vcf_keys</th>
          <td>
            Select additional studies for AF filtering. Separate multiple values
            with '&'. Can only be used with af_from_vcf. Currently supported
            studies are 'uk10k' and 'topmed' (for both GRCh37 and GRCh38).<br />
            <b>Default</b>: not used
          </td>
        </tr>
        <tr>
          <th>only_vcf_freq</th>
          <td>
            By default, both cached frequency data and frequency data from VCF
            files are used in the frequency filtering process when
            <strong>af_from_vcf</strong> is used. Setting this to
            <b>1</b> ensures that only frequency data from VCF files is
            considered<br /><b>Note</b>: Information may be lost using this
            option.
          </td>
        </tr>
        <tr>
          <th>variant_include_list</th>
          <td>
            A list of variants to include even if they do not pass allele
            frequency filtering. The include list is a sorted, bgzipped and
            tabixed VCF file.<br />
            <b>Default</b>: not used
          </td>
        </tr>
        <tr>
          <th>types</th>
          <td>
            SO predicted molecular consequence types to include. Separate
            multiple values with '&'.<br />
            <b>Default set</b>: splice_donor_variant, splice_acceptor_variant,
            stop_gained, frameshift_variant, stop_lost, initiator_codon_variant,
            inframe_insertion, inframe_deletion, missense_variant,
            coding_sequence_variant, start_lost, transcript_ablation,
            transcript_amplification, protein_altering_variant
          </td>
        </tr>
        <tr>
          <th>log_dir</th>
          <td>
            The log_dir is used to store log_files which hold intermediate
            results. The log_dir should be empty on starting analysis.<br />
            <b>Default</b>:
            current_working_dir/g2p_log_dir_[year]_[mon]_[mday]_[hour]_[min]_[sec]
          </td>
        </tr>
        <tr>
          <th>txt_report</th>
          <td>
            Output report listing all G2P complete genes and attributes.<br />
            <b>Default</b>:
            current_working_dir/txt_report_[year]_[mon]_[mday]_[hour]_[min]_[sec].txt
          </td>
        </tr>
        <tr>
          <th>html_report</th>
          <td>
            Output report listing all G2P complete genes and attributes t.
            <br /><b>Default</b>:
            current_working_dir/html_report_[year]_[mon]_[mday]_[hour]_[min]_[sec].html
          </td>
        </tr>
        <tr>
          <th>filter_by_gene_symbol</th>
          <td>
            Set this option to 1 to filter by gene symbol (Required for PanelApp
            data).<br /><b>Default</b>: genes are filtered by HGNC ID
          </td>
        </tr>
        <tr>
          <th>only_mane</th>
          <td>
            By default, every transcript is used in the filtering process. When
            this option is set to 1, variants are only analysed against MANE
            transcripts, which simplifies the output. <br /><b>Note</b>:
            Information may be lost using this option.
          </td>
        </tr>
      </tbody>
    </table>
    <h6 class="pb-2">Additional example commands</h6>
    <p>
      Limiting the molecular consequence type reported and maximum allele
      frequency filter for monoallelic genes:
    </p>
    <div class="citation-div">
      <p>
        vep --i input.vcf --cache --fasta
        /path/to/Homo_sapiens.GRCh38.dna.toplevel.fa.gz --plugin
        G2P,file=G2P.csv,af_monoallelic=0.05,types='stop_gained&frameshift_variant'
      </p>
    </div>
    <p>
      Reporting known variants if they are observed, regardless of whether they
      pass the filtering steps:
    </p>
    <div class="citation-div">
      <p>
        vep -i input.vcf --cache --fasta
        /path/to/Homo_sapiens.GRCh38.dna.toplevel.fa.gz --plugin
        G2P,file=G2P.csv,variant_include_list=known_var.vcf
      </p>
    </div>
    <h6 class="pb-2">Example input and output files</h6>
    <ul>
      <li>
        <a
          href="https://ftp.ebi.ac.uk/pub/databases/gene2phenotype/g2p_vep_plugin/run_vep_g2p_plugin.txt"
          target="_blank"
          style="text-decoration: none"
          >run_vep_g2p_plugin</a
        >
      </li>
      <li>
        <a
          href="https://ftp.ebi.ac.uk/pub/databases/gene2phenotype/g2p_vep_plugin/input.vcf"
          target="_blank"
          style="text-decoration: none"
          >input.vcf</a
        >
      </li>
      <li>
        <a
          href="https://ftp.ebi.ac.uk/pub/databases/gene2phenotype/g2p_vep_plugin/output.txt"
          target="_blank"
          style="text-decoration: none"
          >VEP TXT output</a
        >
      </li>
      <li>
        <a
          href="https://ftp.ebi.ac.uk/pub/databases/gene2phenotype/g2p_vep_plugin/report.html"
          target="_blank"
          style="text-decoration: none"
          >report.html</a
        >
      </li>
      <li>
        <a
          href="https://ftp.ebi.ac.uk/pub/databases/gene2phenotype/g2p_vep_plugin/report.txt"
          target="_blank"
          style="text-decoration: none"
          >report.txt</a
        >
      </li>
    </ul>
    <h6 class="pb-2">Speed and Optimization</h6>
    <ul>
      <li>
        Ensembl VEP can look up existing annotations from locally installed
        cache files in order to increase the speed of computation. The
        installation process will guide you through the cache file selection and
        installation process.
      </li>
      <li>
        <a
          href="http://www.ensembl.org/info/docs/tools/vep/script/vep_other.html#faster"
          target="_blank"
          style="text-decoration: none"
          >More ways to make sure that your Ensembl VEP installation is running
          as fast as possible.</a
        >
      </li>
    </ul>
    <h6 class="pb-2">Using PanelApp data</h6>
    <p>The VEP-G2P accepts PanelApp gene panel data files as input.</p>
    <p>
      PanelApp allows the download of records by confidence level; it is assumed
      that records of the required have been exported and no further confidence
      filtering is done within VEP-G2P.
    </p>
    <p>Other filtering is as follows</p>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>PanelApp Model_Of_Inheritance</th>
          <th>Filtering</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Includes 'monogenic' with or without other inheritance types</td>
          <td>
            Monoallelic filters are applied (default allele frequency not more
            than 0.0001 in reference populations and one variant required).
          </td>
        </tr>
        <tr>
          <td>
            Includes 'biallelic' with or without other inheritance types, except
            monoallelic
          </td>
          <td>
            Biallelic filters are applied (default allele frequency not more
            than 0.005, rules and either one homozygous or 2 heterozygous
            variants required).
          </td>
        </tr>
        <tr>
          <td>
            X-LINKED: hemizygous mutation in males, biallelic mutations in
            females
          </td>
          <td>
            Hemizygous/biallelic filters are applied (default allele frequency
            not more than 0.0001 in reference populations and either one
            homozygous or two heterozygous variants are required).
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style scoped>
.citation-div {
  margin: 0;
}
.citation-div p {
  padding: 15px;
  background: #f4f4f4;
  border-radius: 5px;
  font-family: courier, monospace;
}
code {
  color: black;
  background-color: #f4f4f4;
  border-radius: 3px;
  font-family: courier, monospace;
  padding: 0 3px;
}
h6 {
  font-weight: bold;
}
</style>
