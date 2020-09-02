import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { AnnotonNode, AnnotonNodeClosure, Entity, Evidence, Predicate, Annoton, Cam, AnnotonNodeType } from './../models/annoton/';
import { NoctuaFormConfigService } from './config/noctua-form-config.service';
import { find, filter, each, uniqWith } from 'lodash';
import { noctuaFormConfig } from './../noctua-form-config';
import { Article } from './../models/article';
import { Observable } from 'rxjs';
import { compareEvidenceEvidence, compareEvidenceReference, compareEvidenceWith } from './../models/annoton/evidence';

declare const require: any;

const amigo = require('amigo2');
const golr_conf = require('golr-conf');
const gconf = new golr_conf.conf(amigo.data.golr);
const gserv = environment.globalGolrServer; // "http://golr.berkeleybop.org/";
const impl_engine = require('bbop-rest-manager').jquery;
const golr_manager = require('bbop-manager-golr');
const golr_response = require('bbop-response-golr');
const engine = new impl_engine(golr_response);
engine.use_jsonp(true)


@Injectable({
  providedIn: 'root'
})
export class NoctuaLookupService {
  evidenceList: Evidence[] = [];
  termList: AnnotonNode[] = [];
  name;
  linker;
  golrURLBase;
  localClosures;

  constructor(private httpClient: HttpClient,
    public noctuaFormConfigService: NoctuaFormConfigService) {
    this.name = 'DefaultLookupName';
    this.linker = new amigo.linker();
    this.golrURLBase = environment.globalGolrNeoServer + `select?`;
    // this.trusted = this.$sce.trustAsResourceUrl(this.golrURLBase);

    this.localClosures = [];

    //  this.golrLookupManager();

  }

  lookupFunc() {
    return {
      termLookup: this.termLookup.bind(this),
      evidenceLookup: this.evidenceLookup.bind(this)
    };
  }

  escapeGolrValue(str) {
    const pattern = /([\!\*\+\-\=\<\>\&\|\(\)\[\]\{\}\^\~\?\:\\/"])/g;
    return str.replace(pattern, "\\$1");
  }

  buildQ(str) {
    const manager = new golr_manager(gserv, gconf, engine, 'async');

    manager.set_comfy_query(str);
    return manager.get_query(str);
  }

  termLookup(searchText, requestParams) {
    const self = this;
    requestParams.q = self.buildQ(searchText);
    const params = new HttpParams({
      fromObject: requestParams
    });
    const url = this.golrURLBase + params.toString();

    return this.httpClient.jsonp(url, 'json.wrf').pipe(
      map(response => self._lookupMap(response))
    );
  }

  termPreLookup(type: AnnotonNodeType): Entity[] {
    const self = this;

    const filtered = filter(self.termList, (annotonNode: AnnotonNode) => {
      return annotonNode.type === type;
    });

    return filtered.map((annotonNode: AnnotonNode) => {
      return annotonNode.term;
    });
  }

  evidencePreLookup(): Entity[] {
    const self = this;

    const filtered = uniqWith(this.evidenceList, compareEvidenceEvidence);
    return filtered.map((evidence: Evidence) => {
      return evidence.evidence;
    });
  }

  referencePreLookup(): string[] {
    const self = this;

    const filtered = uniqWith(self.evidenceList, compareEvidenceReference);
    return filtered.map((evidence: Evidence) => {
      return evidence.reference;
    });
  }

  withPreLookup(): string[] {
    const self = this;

    const filtered = uniqWith(self.evidenceList, compareEvidenceWith);
    return filtered.map((evidence: Evidence) => {
      return evidence.with;
    });
  }

  evidenceLookup(searchText: string, category: 'reference' | 'with'): string[] {
    const self = this;

    const filterValue = searchText.toLowerCase();
    let filteredResults: string[] = [];

    switch (category) {
      case 'reference':
        filteredResults = self.referencePreLookup().filter(
          option => option ? option.toLowerCase().includes(filterValue) : false
        );
        break;
      case 'with':
        filteredResults = self.withPreLookup().filter(
          option => option ? option.toLowerCase().includes(filterValue) : false
        );
        break;
    }

    return filteredResults;
  }


  companionLookup(gp, aspect, extraParams) {
    const golrUrl = environment.globalGolrServer + `select?`;

    const requestParams = {
      defType: 'edismax',
      qt: 'standard',
      indent: 'on',
      wt: 'json',
      sort: 'annotation_class_label asc',
      rows: '100',
      start: '0',
      fl: '*,score',
      facet: 'true',
      'facet.mincount': '1',
      'facet.sort': 'count',
      'json.nl': 'arrarr',
      'facet.limit': '100',
      fq: [
        'document_category: "annotation"',
        'aspect: "' + aspect + '"',
        'bioentity: "' + gp + '"'
      ],
      'facet.field': [
        'source',
        'assigned_by',
        'aspect',
        'evidence_type_closure',
        // 'panther_family_label',
        // 'qualifier',
        // 'taxon_label',
        'annotation_class_label',
        // 'regulates_closure_label',
        // 'annotation_extension_class_closure_label'
      ],
      q: '*:*',
      //  packet: '1',
      //  callback_type: 'search',
      // _: Date.now()
    };


    if (extraParams.term) {
      requestParams.fq.push('annotation_class:"' + extraParams.term + '"')
    }

    if (extraParams.evidence) {
      requestParams.fq.push('evidence:"' + extraParams.evidence + '"')
    }

    const params = new HttpParams({
      fromObject: requestParams
    })
    // .set('callback', 'JSONP_CALLBACK')
    //.set('jsonpCallbackParam', 'json.wrf')
    // .set('params', requestParams);


    const url = golrUrl + params.toString();

    return this.httpClient.jsonp(url, 'json.wrf').pipe(
      map(response => {
        const docs = response['response'].docs;
        const result = [];

        each(docs, function (doc) {
          let annotonNode: AnnotonNode;
          const evidence = new Evidence();

          evidence.setEvidence(new Entity(doc.evidence, doc.evidence_label));

          if (doc.reference && doc.reference.length > 0) {
            evidence.reference = doc.reference[0];
          }

          if (doc.evidence_with && doc.evidence_with.length > 0) {
            evidence.with = doc.evidence_with[0];
          }

          evidence.assignedBy = new Entity(null, doc.assigned_by);

          annotonNode = find(result, (srcAnnotonNode: AnnotonNode) => {
            return srcAnnotonNode.getTerm().id === doc.annotation_class;
          });

          if (annotonNode) {
            annotonNode.predicate.addEvidence(evidence);
          } else {
            annotonNode = new AnnotonNode();
            annotonNode.predicate = new Predicate(null);
            annotonNode.term = new Entity(doc.annotation_class, doc.annotation_class_label);
            annotonNode.predicate.addEvidence(evidence);
            result.push(annotonNode);
          }
        });

        return result;
      }));
  }

  categoryToClosure(categories) {
    return categories.map((category) => {
      return `${category.categoryType}:"${category.category}"`;
    }).join(' OR ');
  }

  isaClosure(a: string, b: string) {
    const self = this;

    const requestParams = {
      q: self.buildQ(a),
      defType: 'edismax',
      indent: 'on',
      qt: 'standard',
      wt: 'json',
      rows: '2',
      start: '0',
      fl: '*,score',
      'facet': 'true',
      'facet.mincount': '1',
      'facet.sort': 'count',
      'facet.limit': '25',
      'json.nl': 'arrarr',
      packet: '1',
      callback_type: 'search',
      'facet.field': [
        'source',
        'subset',
        'idspace',
        'is_obsolete'
      ],
      fq: [
        'document_category:"ontology_class"',
        b
      ],
      qf: [
        'annotation_class^3',
        'isa_closure^1',
      ]
    };

    const params = new HttpParams({
      fromObject: requestParams
    });

    const url = this.golrURLBase + params.toString();

    return this.httpClient.jsonp(url, 'json.wrf').pipe(
      map(response => {
        const docs = response['response'].docs;
        let result = false;

        if (docs.length > 0) {
          result = docs[0].annotation_class === a;
        }
        return result;
      }));
  }

  // Closures
  addLocalClosure(term, closure, isaClosure) {
    const self = this;
    const data = {
      term: term,
      closure: closure,
      isaClosure: isaClosure
    };

    if (!self.localClosureExist(term, closure)) {
      self.localClosures.push(data);
    }
  }

  localClosureExist(term, closure) {
    const self = this;
    const data = new AnnotonNodeClosure(term, closure);

    return (find(self.localClosures, data));
  }

  getLocalClosurex(term: string, categories: any[]) {
    const self = this;
    const closure = self.categoryToClosure(categories);
    const data = self.localClosureExist(term, closure);

    if (data) {
      return data.isaClosure;
    } else {
      // we don't know locally
      return undefined;
    }
  }

  getLocalClosures(term: string) {
    const self = this;

    return filter(self.localClosures, { term: term, isaClosure: true });
  }

  getTermURL(id: string) {
    const self = this;

    if (id.startsWith('ECO')) {
      return 'http://www.evidenceontology.org/term/' + id;
    } else if (id.startsWith('PMID')) {
      const idAccession = id.split(':');
      if (idAccession.length > 1) {
        return 'https://www.ncbi.nlm.nih.gov/pubmed/' + idAccession[1].trim();
      } else {
        return null;
      }

    } else {
      return self.linker.url(id);
    }
  }


  getPubmedInfo(pmid: string) {
    const url = environment.pubMedSummaryApi + pmid;

    return this.httpClient
      .get(url)
      .pipe(
        map(res => res['result']),
        map(res => res[pmid]),
        map(res => this._addArticles(res, pmid)),
      );
  }

  private _addArticles(res, pmid: string) {
    const self = this;
    if (!res) {
      return;
    }

    const article = new Article();
    article.title = res.title;
    article.link = self.linker.url(`${noctuaFormConfig.evidenceDB.options.pmid.name}:${pmid}`);
    article.date = res.pubdate;
    if (res.authors && Array.isArray(res.authors)) {
      article.author = res.authors.map(author => {
        return author.name;
      }).join(', ');
    }

    return article;
  }

  private _lookupMap(response) {
    const self = this;
    const data = response.response.docs;
    const result = data.map((item) => {
      let xref;
      if (item.database_xref && item.database_xref.length > 0) {
        const xrefDB = item.database_xref[0].split(':');
        xref = xrefDB.length > 1 ? xrefDB[1] : xrefDB[0];
      }

      return {
        id: item.annotation_class,
        label: item.annotation_class_label,
        link: self.getTermURL(item.annotation_class),
        description: item.description,
        isObsolete: item.is_obsolete,
        rootTypes: self._makeEntitiesArray(item.isa_closure, item.isa_closure_label),
        xref: xref
      };
    });

    console.log(result);
    return result;
  }

  private _makeEntitiesArray(ids: string[], labels: string[]): Entity[] {
    let result = [];

    if (ids.length === labels.length) {
      result = ids.map((id, key) => {
        return new Entity(id, labels[key]);
      });
    }

    return filter(result, (item: Entity) => {
      return !item.id.startsWith('BFO');
    });
  }

}
