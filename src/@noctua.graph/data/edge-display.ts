import { noctuaFormConfig } from "noctua-form-base";

export function getEdgeColor(edgeId) {
    switch (edgeId) {
        case noctuaFormConfig.edge.directlyRegulates:
        case noctuaFormConfig.edge.causallyUpstreamOfOrWithin:
        case noctuaFormConfig.edge.causallyUpstreamOf:
            return 'grey'
        case noctuaFormConfig.edge.positivelyRegulates:
        case noctuaFormConfig.edge.directlyPositivelyRegulates:
        case noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect:
            return 'green'
        case noctuaFormConfig.edge.negativelyRegulates:
        case noctuaFormConfig.edge.directlyNegativelyRegulates:
        case noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect:
            return 'red'
        default:
            return 'black'
    }

}


