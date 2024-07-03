import { Entity } from "../activity/entity";
import { GOlrResponse } from "../golr";

export interface AnnotationExtensionForm {
  extensionEdge: Entity;
  extensionTerm: GOlrResponse;
}

export interface AnnotationEvidenceForm {
  evidenceCode: GOlrResponse;
  reference: string;
  withFrom: string;
}

export interface StandardAnnotationForm {
  gp: GOlrResponse;
  isComplement: boolean;
  gpToTermEdge: Entity;
  goterm: GOlrResponse;
  annotationExtensions: AnnotationExtensionForm[];
  evidence: AnnotationEvidenceForm;
}
