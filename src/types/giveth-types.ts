export interface ProjectByIdResponse {
  data: {
    projectById: {
      id: number;
      title: string;
      slug: string;
      description: string;
      verified: boolean;
      socialMedia: SocialMedia[];
      status: Status;
    };
  };
}

export interface SocialMedia {
  link: string;
  type: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
}

export interface Status {
  id: number;
  symbol: string;
  name: string;
  description: string;
}