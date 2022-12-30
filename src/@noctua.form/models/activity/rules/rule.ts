export class Rule {
  id: string;
  label: string;
  description: string
  url: string;

  constructor(id?: string, label?: string, description?: string, url?: string) {
    this.id = id;
    this.label = label;
    this.description = description;
    this.url = url;
  }

}