export interface Major {
  name: string;
  code: string;
  subjects: Subject[];
  disabled?: boolean;
}

export interface Subject {
  name: string;
  code: string;
  classes: SubjectClass[];
  disabled?: boolean;
}

export interface SubjectClass {
  name: string;
  code: string;
  disabled?: boolean;
}

export interface AdminConfiguration {
  majors: Major[];
}
