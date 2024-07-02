import { Evidence } from "../activity/evidence";
import { GOlrResponse } from "../golr";

export interface StandardAnnotationForm {
  gp: GOlrResponse;
  isComplement: string;
  gpToTermEdge: string;
  goterm: GOlrResponse;
  annotationExtensions: AnnotationExtensionForm[];
  evidence: Evidence;
}

export interface AnnotationExtensionForm {
  extensionEdge: string;
  extensionTerm: GOlrResponse;
}
export interface AnnotationEvidenceForm {
  evidenceCode: GOlrResponse;
  reference: string;
  withFrom: string;
}