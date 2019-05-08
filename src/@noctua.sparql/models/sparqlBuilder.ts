export class SparqlBuilder {

    static PREFIX = {
        rdf: '<http://www.w3.org/1999/02/22-rdf-syntax-ns#>',
        rdfs: '<http://www.w3.org/2000/01/rdf-schema#>',
        dc: '<http://purl.org/dc/elements/1.1/>',
        metago: '<http://model.geneontology.org/>',
        owl: '<http://www.w3.org/2002/07/owl#>',
        GO: '<http://purl.obolibrary.org/obo/GO_>',
        BP: '<http://purl.obolibrary.org/obo/GO_0008150>',
        MF: '<http://purl.obolibrary.org/obo/GO_0003674>',
        CC: '<http://purl.obolibrary.org/obo/GO_0005575>',
        providedBy: '<http://purl.org/pav/providedBy>'
    }

    _prefix = '';
    _select = "";
    _orderBy = "";
    _groupBy = ""


    prefix(prefix) {
        this._prefix += `PREFIX ${prefix}:${SparqlBuilder.PREFIX[prefix]}`
    }

    select(select) {
        this._select += ` ${select}`;
    }

    where(where) {

    }

    graph() {

    }

    orderBy(orderBy) {
        this._orderBy += ` ${orderBy}`
    }


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
}