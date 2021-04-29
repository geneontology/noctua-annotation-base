import { FormControl, FormGroup } from "@angular/forms";


export class SettingsOptions {
  showEvidence = false;
  showReference = false;
  showEvidenceCode = false;
  showWith = false;

  createSettingsForm() {
    return new FormGroup({
      showEvidence: new FormControl(this.showEvidence),
      showEvidenceCode: new FormControl(this.showEvidenceCode),
      showReference: new FormControl(this.showReference),
      showWith: new FormControl(this.showWith),
    });
  }

  populateSettings(value) {
    this.showEvidence = value.showEvidence;
    this.showReference = value.showReference;
    this.showEvidenceCode = value.showEvidenceCode;
    this.showWith = value.showWith;
  }
};