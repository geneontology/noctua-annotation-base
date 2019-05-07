import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { map, finalize, filter, reduce, catchError, retry, tap } from 'rxjs/operators';

import { CurieService } from './../../../@noctua.curie/services/curie.service';
import {
  NoctuaGraphService,
  AnnotonNode,
  NoctuaFormConfigService,
  Cam,
  CamRow,
  Curator,
  Group,
  NoctuaUserService
} from 'noctua-form-base'

import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';
declare const require: any;
const each = require('lodash/forEach');

@Injectable({
  providedIn: 'root'
})
export class SparqlService {
  separator = '@@';
  baseUrl = environment.spaqrlApiUrl;
  curieUtil: any;
  cams: any[] = [];
  loading: boolean = false;
  onCamsChanged: BehaviorSubject<any>;
  onCamChanged: BehaviorSubject<any>;
  onCuratorFilterChanged: BehaviorSubject<any>;

  searchSummary: any = {}

  constructor(public noctuaFormConfigService: NoctuaFormConfigService,
    public noctuaUserService: NoctuaUserService,
    private httpClient: HttpClient,
    private noctuaGraphService: NoctuaGraphService,
    private curieService: CurieService) {
    this.onCamsChanged = new BehaviorSubject({});
    this.onCamChanged = new BehaviorSubject({});
    this.curieUtil = this.curieService.getCurieUtil();
  }

  //GO:0099160
  getCamsByGoTerm(term): Observable<any> {
    const self = this;

    self.loading = true;
    self.searchSummary = {}
    return this.httpClient
      .get(this.baseUrl + this.buildCamsByGoTermQuery(term))
      .pipe(
        map(res => res['results']),
        map(res => res['bindings']),
        tap(val => console.dir(val)),
        map(res => this.addCam(res)),
        tap(val => console.dir(val)),
        tap(res => {
          self.searchSummary =
            {
              term: term
            }
        }),
        finalize(() => {
          self.loading = false;
        })
      );
  }

  //PMID:25869803
  getCamsByPMID(pmid): Observable<any> {
    const self = this;

    self.loading = true;
    self.searchSummary = {}
    return this.httpClient
      .get(this.baseUrl + this.buildCamsPMIDQuery(pmid))
      .pipe(
        map(res => res['results']),
        map(res => res['bindings']),
        tap(val => console.dir(val)),
        map(res => this.addCam(res)),
        tap(val => console.dir(val)), tap(res => {
          self.searchSummary =
            {
              PMID: pmid
            }
        }),

        finalize(() => {
          self.loading = false;
        })
      );
  }

  //Ina Rnor (RGD:2911)
  getCamsByGP(gp): Observable<any> {
    const self = this;

    self.loading = true;
    self.searchSummary = {}
    return this.httpClient
      .get(this.baseUrl + this.buildCamsByGP(gp))
      .pipe(
        map(res => res['results']),
        map(res => res['bindings']),
        tap(val => console.dir(val)),
        map(res => this.addCam(res)),
        tap(val => console.dir(val)),
        tap(res => {
          self.searchSummary =
            {
              'Gene Product': gp
            }
        }),
        finalize(() => {
          self.loading = false;
        })
      );
  }

  getCamsByCurator(orcid): Observable<any> {
    const self = this;

    self.loading = true;
    self.searchSummary = {}
    return this.httpClient
      .get(this.baseUrl + this.buildCamsByCuratorQuery(orcid))
      .pipe(
        map(res => res['results']),
        map(res => res['bindings']),
        tap(res => {
          self.searchSummary =
            {
              curator: orcid
            }
        }),
        tap(val => console.dir(val)),
        map(res => this.addCam(res)),
        tap(val => console.dir(val)),
        finalize(() => {
          self.loading = false;
        })
      );
  }

  getCamsBySpecies(species): Observable<any> {
    const self = this;

    self.loading = true;
    self.searchSummary = {}
    return this.httpClient
      .get(this.baseUrl + this.buildCamsBySpeciesQuery(species.taxon_id))
      .pipe(
        map(res => res['results']),
        map(res => res['bindings']),
        tap(res => {
          self.searchSummary =
            {
              species: species.long_name
            }
        }),
        tap(val => console.dir(val)),
        map(res => this.addCam(res)),
        tap(val => console.dir(val)),
        finalize(() => {
          self.loading = false;
        })
      );
  }

  getAllCurators(): Observable<any> {
    return this.httpClient
      .get(this.baseUrl + this.buildAllCuratorsQuery())
      .pipe(
        map(res => res['results']),
        map(res => res['bindings']),
        tap(val => console.dir(val)),
        map(res => this.addCurator(res)),
        tap(val => console.dir(val))
      );
  }

  getAllGroups(): Observable<any> {
    return this.httpClient
      .get(this.baseUrl + this.buildAllGroupsQuery())
      .pipe(
        map(res => res['results']),
        map(res => res['bindings']),
        tap(val => console.dir(val)),
        map(res => this.addGroup(res)),
        tap(val => console.dir(val))
      );
  }

  addCam(res) {
    const self = this;
    let result: Array<Cam> = [];

    res.forEach((response) => {
      let modelId = self.curieUtil.getCurie(response.model.value)//this.noctuaFormConfigService.getModelId(response.model.value);
      let cam = new Cam();

      cam.id = uuid();
      cam.graph = null;
      cam.id = modelId;
      cam.title = response.modelTitle.value;
      cam.model = Object.assign({}, {
        modelInfo: this.noctuaFormConfigService.getModelUrls(modelId)
      });

      if (response.date) {
        cam.date = response.date.value
      }

      if (response.groups) {
        cam.groups = <Group[]>response.groups.value.split(self.separator).map(function (url) {
          return { url: url };
        }); ``
      }

      if (response.contributors) {
        cam.contributors = <Curator[]>response.contributors.value.split(self.separator).map((orcid) => {
          let contributor = _.find(self.noctuaUserService.curators, (curator) => {
            return curator.orcid === orcid
          })

          return contributor ? contributor : { orcid: orcid };
        });
      }

      if (response.entities) {
        cam.filter.individualIds.push(...response.entities.value.split(self.separator).map((iri) => {
          return self.curieUtil.getCurie(iri);
        }));

      } else {
        cam.resetFilter();
      }

      result.push(cam);
    });

    return result;
  }

  addCurator(res) {
    let result: Array<Curator> = [];

    res.forEach((erg) => {
      let curator = new Curator()

      curator.orcid = erg.orcid.value;
      curator.name = erg.name.value;
      curator.cams = erg.cams.value;
      curator.group = {
        url: erg.affiliations.value
      }
      result.push(curator);
    });
    return result;
  }

  addGroup(res) {
    let result: Array<Group> = [];

    res.forEach((erg) => {
      result.push({
        url: erg.url.value,
        name: erg.name.value,
        cams: erg.cams.value,
        curatorsCount: erg.curators.value,
        curators: erg.orcids.value.split('@@').map(function (orcid) {
          return { orcid: orcid };
        }),
      });
    });
    return result;
  }

  addGroupCurators(groups, curators) {
    const self = this;

    _.each(groups, (group) => {
      _.each(group.curators, (curator) => {
        let srcCurator = _.find(curators, { orcid: curator.orcid })
        curator.name = srcCurator['name'];
        curator.cams = srcCurator['cams'];
      });
    })
  }

  addBasicCamChildren(srcCam, annotons) {
    const self = this;

    srcCam.camRow = [];

    _.each(annotons, function (annoton) {
      let cam = self.annotonToCam(srcCam, annoton);

      cam.model = srcCam.model;
      cam.graph = srcCam.graph;
      srcCam.camRow.push(cam);
    });

    this.onCamsChanged.next(srcCam.camRow);
  }

  addCamChildren(srcCam, annotons) {
    const self = this;

    srcCam.camRow = [];

    _.each(annotons, function (annoton) {
      let cam = self.annotonToCam(srcCam, annoton);

      cam.model = srcCam.model;
      cam.graph = srcCam.graph;
      srcCam.camRow.push(cam);
    });

    this.onCamsChanged.next(srcCam.camRow);
  }

  annotonToCam(cam, annoton) {

    let destNode = new AnnotonNode()
    destNode.deepCopyValues(annoton.node);

    let result: CamRow = {
      // id: uuid(),
      treeLevel: annoton.treeLevel,
      // model: cam.model,
      annotatedEntity: {
        id: '',
        label: annoton.gp
      },
      relationship: annoton.relationship,
      aspect: annoton.aspect,
      term: annoton.term,
      relationshipExt: annoton.relationshipExt,
      extension: annoton.extension,
      evidence: annoton.evidence,
      reference: annoton.reference,
      with: annoton.with,
      assignedBy: annoton.assignedBy,
      srcNode: annoton.node,
      destNode: destNode
    }

    return result;
  }

  //GO:0003723
  buildCamsByGoTermQuery(goTerm) {
    var query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/> 
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX GO: <http://purl.obolibrary.org/obo/GO_>
    PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
    PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
    PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>
    PREFIX providedBy: <http://purl.org/pav/providedBy>

    SELECT distinct ?model ?modelTitle ?aspect ?term ?termLabel ?date
                    (GROUP_CONCAT(distinct  ?entity;separator="@@") as ?entities)
                    (GROUP_CONCAT(distinct ?contributor;separator="@@") as ?contributors)
                    (GROUP_CONCAT(distinct ?providedBy;separator="@@") as ?groups)
    WHERE 
    {
      GRAPH ?model {
          ?model metago:graphType metago:noctuaCam;
                dc:date ?date;
                dc:title ?modelTitle; 
                dc:contributor ?contributor .

          optional {?model providedBy: ?providedBy } .
          ?entity rdf:type owl:NamedIndividual .
          ?entity rdf:type ?term .
          FILTER(?term = ${goTerm.id})
        }
        VALUES ?aspect { BP: MF: CC: } .
        ?entity rdf:type ?aspect .
        ?term rdfs:label ?termLabel  .
    }

    GROUP BY ?model ?modelTitle ?aspect ?term ?termLabel ?date
    ORDER BY DESC(?date)
    `;

    return '?query=' + encodeURIComponent(query);
  }


  buildAllCuratorsQuery() {
    let query = `
      PREFIX metago: <http://model.geneontology.org/>
      PREFIX dc: <http://purl.org/dc/elements/1.1/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
      PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066> 
          
      SELECT  ?orcid ?name    (GROUP_CONCAT(distinct ?organization;separator="@@") AS ?organizations) 
                              (GROUP_CONCAT(distinct ?affiliation;separator="@@") AS ?affiliations) 
                              (COUNT(distinct ?cam) AS ?cams)
      WHERE 
      {
          ?cam metago:graphType metago:noctuaCam .
          ?cam dc:contributor ?orcid .
                  
          BIND( IRI(?orcid) AS ?orcidIRI ).
                  
          optional { ?orcidIRI rdfs:label ?name } .
          optional { ?orcidIRI <http://www.w3.org/2006/vcard/ns#organization-name> ?organization } .
          optional { ?orcidIRI has_affiliation: ?affiliation } .
            
          BIND(IF(bound(?name), ?name, ?orcid) as ?name) .            
      }
      GROUP BY ?orcid ?name 
      `
    return '?query=' + encodeURIComponent(query);
  }

  buildCamsByCuratorQuery(orcid) {
    let modOrcid = this.getOrcid(orcid);

    let query = `
      PREFIX metago: <http://model.geneontology.org/>
      PREFIX dc: <http://purl.org/dc/elements/1.1/>
      PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> 
      PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
      PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066> 
      PREFIX enabled_by: <http://purl.obolibrary.org/obo/RO_0002333>
      PREFIX obo: <http://www.geneontology.org/formats/oboInOwl#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX BP: <http://purl.obolibrary.org/obo/GO_0008150>
      PREFIX MF: <http://purl.obolibrary.org/obo/GO_0003674>
      PREFIX CC: <http://purl.obolibrary.org/obo/GO_0005575>
          
      SELECT  ?model ?modelTitle	(GROUP_CONCAT(distinct ?spec;separator="@@") as ?species)
                (GROUP_CONCAT(distinct ?goid;separator="@@") as ?bpids)
                (GROUP_CONCAT(distinct ?goname;separator="@@") as ?bpnames)
                (GROUP_CONCAT(distinct ?gpid;separator="@@") as ?gpids)
                (GROUP_CONCAT(distinct ?gpname;separator="@@") as ?gpnames)
      WHERE 
      {            
          BIND(` + modOrcid + ` as ?orcid) .
          BIND(IRI(?orcid) as ?orcidIRI) .
                    
          # Getting some information on the model
          GRAPH ?model 
          {
              ?model 	metago:graphType metago:noctuaCam ;
                      dc:date ?date ;
                      dc:title ?modelTitle ;
                      dc:contributor ?orcid .
              
             ?entity rdf:type owl:NamedIndividual .
             ?entity rdf:type ?goid .
  
              ?s enabled_by: ?gpentity .    
              ?gpentity rdf:type ?gpid .
              FILTER(?gpid != owl:NamedIndividual) .
         }
            
          VALUES ?aspect { BP: } . 
          # rdf:type faster then subClassOf+ but require filter 			
          # ?goid rdfs:subClassOf+ ?aspect .
      ?entity rdf:type ?aspect .
      
      # Filtering out the root BP, MF & CC terms
      filter(?goid != MF: )
      filter(?goid != BP: )
      filter(?goid != CC: )
      ?goid rdfs:label ?goname .
            
          # Getting some information on the contributor
          optional { ?orcidIRI rdfs:label ?name } .
          BIND(IF(bound(?name), ?name, ?orcid) as ?name) .
          optional { ?orcidIRI vcard:organization-name ?organization } .
          optional { 
              ?orcidIRI has_affiliation: ?affiliationIRI .
              ?affiliationIRI rdfs:label ?affiliation
          } .
            
        
          # Require each GP to have a correct URI, not the case for SYNGO at this time
          optional {
          ?gpid rdfs:label ?gpname .
          ?gpid rdfs:subClassOf ?v0 . 
          ?v0 owl:onProperty <http://purl.obolibrary.org/obo/RO_0002162> . 
          ?v0 owl:someValuesFrom ?taxon .
                
          ?taxon rdfs:label ?spec .  
          }
            
      }
      GROUP BY ?model ?modelTitle
      ORDER BY DESC(?date)
      `
    return '?query=' + encodeURIComponent(query);
  }

  buildAllGroupsQuery() {
    let query = `
        PREFIX metago: <http://model.geneontology.org/>
        PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
        PREFIX has_affiliation: <http://purl.obolibrary.org/obo/ERO_0000066> 
		    PREFIX hint: <http://www.bigdata.com/queryHints#>
    
        SELECT  distinct ?name ?url         (GROUP_CONCAT(distinct ?orcidIRI;separator="@@") AS ?orcids) 
                                            (COUNT(distinct ?orcidIRI) AS ?curators)
                                            (COUNT(distinct ?cam) AS ?cams)
        WHERE    
        {
          ?cam metago:graphType metago:noctuaCam .
          ?cam dc:contributor ?orcid .
          BIND( IRI(?orcid) AS ?orcidIRI ).  
          ?orcidIRI has_affiliation: ?url .
          ?url rdfs:label ?name .     
          hint:Prior hint:runLast true .
        }
        GROUP BY ?url ?name`

    return '?query=' + encodeURIComponent(query);
  }

  buildCamsPMIDQuery(pmid) {
    let query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/> 
    PREFIX metago: <http://model.geneontology.org/>
    PREFIX providedBy: <http://purl.org/pav/providedBy>
            
    SELECT distinct ?model ?modelTitle ?aspect ?term ?termLabel ?date
                        (GROUP_CONCAT( ?entity;separator="@@") as ?entities)
                        (GROUP_CONCAT(distinct ?contributor;separator="@@") as ?contributors)
                        (GROUP_CONCAT( ?providedBy;separator="@@") as ?providedBys)
    WHERE 
    {
        GRAPH ?model {
            ?model metago:graphType metago:noctuaCam ;    
                dc:date ?date;
                dc:title ?modelTitle; 
                dc:contributor ?contributor .
            optional {?model providedBy: ?providedBy } .
            ?entity dc:source ?source .
            BIND(REPLACE(?source, " ", "") AS ?source) .
            FILTER((CONTAINS(?source, "${pmid}")))
        }           
    }
    GROUP BY ?model ?modelTitle ?aspect ?term ?termLabel ?date
    ORDER BY DESC(?date)`

    return '?query=' + encodeURIComponent(query);
  }

  buildCamsByGP(gp) {

    const id = this.curieUtil.getIri(gp.id)

    console.log(id, "===")
    let query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> 
    PREFIX dc: <http://purl.org/dc/elements/1.1/> 
    PREFIX metago: <http://model.geneontology.org/>    
    PREFIX enabled_by: <http://purl.obolibrary.org/obo/RO_0002333>    
    PREFIX providedBy: <http://purl.org/pav/providedBy>
            
    SELECT distinct ?model ?modelTitle ?aspect ?term ?termLabel ?date
                        (GROUP_CONCAT(distinct  ?entity;separator="@@") as ?entities)
                        (GROUP_CONCAT(distinct  ?contributor;separator="@@") as ?contributors)
                        (GROUP_CONCAT(distinct  ?providedBy;separator="@@") as ?providedBys)
    
    WHERE 
    {
    
      GRAPH ?model {
        ?model metago:graphType metago:noctuaCam;
            dc:date ?date;
            dc:title ?modelTitle; 
            dc:contributor ?contributor .

        optional {?model providedBy: ?providedBy } .
        ?s enabled_by: ?entity .    
        ?entity rdf:type ?identifier .
        FILTER(?identifier = <` + id + `>) .         
      }
      
    }
    GROUP BY ?model ?modelTitle ?aspect ?term ?termLabel ?date
    ORDER BY DESC(?date)`

    return '?query=' + encodeURIComponent(query);
  }


  buildCamsBySpeciesQuery(taxon) {
    let taxonUrl = "<http://purl.obolibrary.org/obo/NCBITaxon_" + taxon + ">";

    let query = `
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX owl: <http://www.w3.org/2002/07/owl#>
          PREFIX metago: <http://model.geneontology.org/>
          PREFIX dc: <http://purl.org/dc/elements/1.1/>
  
          PREFIX enabled_by: <http://purl.obolibrary.org/obo/RO_0002333>
          PREFIX in_taxon: <http://purl.obolibrary.org/obo/RO_0002162>
  
          SELECT distinct ?model ?modelTitle
  
          WHERE 
          {
              GRAPH ?model {
                  ?model metago:graphType metago:noctuaCam;
                      dc:title ?modelTitle .
                  ?s enabled_by: ?entity .    
                  ?entity rdf:type ?identifier .
                  FILTER(?identifier != owl:NamedIndividual) .         
              }
  
              ?identifier rdfs:subClassOf ?v0 . 
              ?identifier rdfs:label ?name .
              
              ?v0 owl:onProperty in_taxon: . 
              ?v0 owl:someValuesFrom ` + taxonUrl + `
          }
          LIMIT 100`
    return '?query=' + encodeURIComponent(query);
  }

  getOrcid(orcid) {
    return "\"" + orcid + "\"^^xsd:string";
  }

}
