import { ShexShapeAssociation } from "../shape";

export class DataUtils {
  public static getSubjectShapes(shapes: ShexShapeAssociation[], subjectId): ShexShapeAssociation[] {
    return shapes.filter(shape => shape.subject === subjectId)
  }

  public static getPredicates(shapes: ShexShapeAssociation[]): string[] {
    const predicates = shapes.map((shape) => {
      return shape.predicate
    });

    return [...new Set(predicates)];

  }

  public static getRangeLabels(shapes: ShexShapeAssociation[], lookupTable): string[] {
    const predicates = shapes.map((shape) => {
      const range = shape.object.map((term) => {
        return lookupTable[term]
      })

      return shape.predicate + range.join(', ')


    });

    return [...new Set(predicates)];

  }
}